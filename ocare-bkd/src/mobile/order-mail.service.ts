import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { PrismaService } from 'src/prisma/prisma.service';

type MailStage = 'RECEIVED' | 'PACKAGING' | 'IN_DELIVERY' | 'DELIVERED' | 'CANCELLED' | 'FAILED';

interface OrderLine {
  name: string;
  quantity: number;
  price: number | string;
}

const STEPS: Array<{ stage: MailStage; label: string }> = [
  { stage: 'RECEIVED', label: 'Received' },
  { stage: 'PACKAGING', label: 'Packing' },
  { stage: 'IN_DELIVERY', label: 'On the way' },
  { stage: 'DELIVERED', label: 'Delivered' },
];

const COPY: Record<MailStage, { subject: string; headline: string; body: string }> = {
  RECEIVED: {
    subject: 'We received your order',
    headline: 'Thanks, your order is in',
    body: 'Our pharmacy team will check it and call you to confirm delivery.',
  },
  PACKAGING: {
    subject: 'Your order is being packed',
    headline: 'A pharmacist is packing your order',
    body: 'We are checking every item before it leaves the pharmacy.',
  },
  IN_DELIVERY: {
    subject: 'Your order is on the way',
    headline: 'Your order is on the way',
    body: 'Your rider has left the pharmacy. Keep your phone nearby.',
  },
  DELIVERED: {
    subject: 'Your order has been delivered',
    headline: 'Delivered. Get well soon!',
    body: 'Thank you for choosing Ocare. Reply to the pharmacist in the app if you have any questions about your medicines.',
  },
  CANCELLED: {
    subject: 'Your order was cancelled',
    headline: 'Your order was cancelled',
    body: 'Nothing will be delivered for this order.',
  },
  FAILED: {
    subject: 'We could not complete your order',
    headline: 'We could not complete your order',
    body: 'Please message the pharmacist in the app or call us so we can help.',
  },
};

const esc = (s: unknown) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

const ugx = (n: number | string) => `UGX ${new Intl.NumberFormat('en-UG').format(Math.round(Number(n) || 0))}`;

/**
 * Emails customers about their orders (received → packing → on the way → delivered,
 * or cancelled) and about new pharmacist replies. Templates are inline so they
 * work in production builds without copying asset files.
 * Sending never throws: an email problem must not block the order update.
 */
@Injectable()
export class OrderMailService {
  private readonly logger = new Logger(OrderMailService.name);
  private resend: Resend | null = null;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const key = this.config.get<string>('RESEND_API_KEY');
    if (key) this.resend = new Resend(key);
  }

  private appUrl(path: string) {
    const base = (this.config.get<string>('FRONTEND_URL') || 'https://www.ocareug.com').replace(/\/+$/, '');
    return `${base}${path}`;
  }

  private async send(to: string, subject: string, html: string) {
    const from = this.config.get<string>('FROM_EMAIL');
    if (!this.resend || !from) {
      this.logger.debug('Email not configured (RESEND_API_KEY / FROM_EMAIL); skipping');
      return;
    }
    if (!to || to.endsWith('.invalid')) return; // deleted accounts
    try {
      const { error } = await this.resend.emails.send({ from, to, subject, html });
      if (error) this.logger.warn(`Email to ${to} failed: ${error.message}`);
    } catch (err) {
      this.logger.warn(`Email to ${to} failed: ${(err as Error).message}`);
    }
  }

  /** Looks up the order + customer and emails them about the given stage. */
  async orderUpdate(
    saleId: string,
    stage: MailStage,
    extra: { note?: string | null; riderName?: string | null; riderPhone?: string | null; estimatedDeliveryAt?: Date | string | null } = {},
  ) {
    try {
      const sale = await this.prisma.sale.findUnique({
        where: { id: saleId },
        include: { client: { select: { email: true, firstName: true, fullName: true, deletedAt: true } } },
      });
      if (!sale || !sale.client || sale.client.deletedAt) return;
      if (!['Web', 'Mobile'].includes(sale.type)) return; // in-shop customers don't get order emails

      const ref = `ORD-${sale.id.slice(-8).toUpperCase()}`;
      const copy = COPY[stage];
      const items = (Array.isArray(sale.items) ? sale.items : []) as unknown as OrderLine[];
      const address = sale.deliveryAddress as { town?: string; village?: string; landmark?: string } | null;

      const html = this.layout({
        preheader: `${ref}: ${copy.headline}`,
        body: `
          <p style="margin:0 0 4px;font-size:14px;color:#4b5a50;">Hi ${esc(sale.client.firstName || sale.client.fullName)},</p>
          <h1 style="margin:0 0 8px;font-size:24px;line-height:1.25;color:#132018;">${esc(copy.headline)}</h1>
          <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#4b5a50;">${esc(copy.body)}</p>
          ${this.stepper(stage)}
          ${extra.note ? `<p style="margin:0 0 16px;padding:12px 14px;background:#f4f7f3;border-radius:12px;font-size:14px;color:#132018;"><strong>Note from the pharmacy:</strong> ${esc(extra.note)}</p>` : ''}
          ${
            stage === 'IN_DELIVERY' && extra.riderName
              ? `<p style="margin:0 0 16px;padding:12px 14px;background:#e6f1e8;border-radius:12px;font-size:14px;color:#132018;">
                   <strong>Your rider:</strong> ${esc(extra.riderName)}${extra.riderPhone ? ` · <a href="tel:${esc(extra.riderPhone)}" style="color:#0a4d1f;">${esc(extra.riderPhone)}</a>` : ''}
                   ${extra.estimatedDeliveryAt ? `<br/><strong>Expected:</strong> ${esc(new Date(extra.estimatedDeliveryAt).toLocaleString('en-UG', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Africa/Kampala' }))}` : ''}
                 </p>`
              : ''
          }
          ${this.itemsTable(ref, items, sale.total.toString())}
          ${address?.town ? `<p style="margin:16px 0 0;font-size:14px;color:#4b5a50;"><strong style="color:#132018;">Delivering to:</strong> ${esc(address.village)}, ${esc(address.town)}${address.landmark ? ` (near ${esc(address.landmark)})` : ''}</p>` : ''}
          ${this.button('Track your order', this.appUrl(`/order/${sale.id}`))}
        `,
      });

      await this.send(sale.client.email, `${copy.subject} · ${ref}`, html);
    } catch (err) {
      this.logger.warn(`Order email for ${saleId} failed: ${(err as Error).message}`);
    }
  }

  /** One email per batch of unread pharmacist replies (not one per message). */
  async pharmacistReplied(clientId: string, preview: string) {
    try {
      const client = await this.prisma.client.findUnique({
        where: { id: clientId },
        select: { email: true, firstName: true, fullName: true, deletedAt: true },
      });
      if (!client || client.deletedAt) return;
      const short = preview.length > 240 ? `${preview.slice(0, 237)}…` : preview;
      const html = this.layout({
        preheader: 'A pharmacist replied to your message',
        body: `
          <p style="margin:0 0 4px;font-size:14px;color:#4b5a50;">Hi ${esc(client.firstName || client.fullName)},</p>
          <h1 style="margin:0 0 16px;font-size:24px;line-height:1.25;color:#132018;">A pharmacist replied to you</h1>
          <div style="margin:0 0 8px;padding:14px 16px;background:#f4f7f3;border-radius:16px 16px 16px 4px;font-size:15px;line-height:1.6;color:#132018;">${esc(short)}</div>
          ${this.button('Open the chat', this.appUrl('/chat'))}
          <p style="margin:16px 0 0;font-size:13px;color:#7d8a81;">For your privacy, reply in the Ocare app rather than to this email.</p>
        `,
      });
      await this.send(client.email, 'A pharmacist replied to your message', html);
    } catch (err) {
      this.logger.warn(`Chat email for ${clientId} failed: ${(err as Error).message}`);
    }
  }

  // ───────────── HTML pieces (email-safe tables + inline styles) ─────────────
  private stepper(stage: MailStage) {
    if (stage === 'CANCELLED' || stage === 'FAILED') return '';
    const current = STEPS.findIndex((s) => s.stage === stage);
    const cells = STEPS.map((s, i) => {
      const done = i <= current;
      return `<td align="center" style="width:25%;padding:0 2px;">
        <div style="height:6px;border-radius:3px;background:${done ? '#0a4d1f' : '#dfe8e0'};"></div>
        <div style="margin-top:6px;font-size:12px;font-weight:${i === current ? '700' : '500'};color:${done ? '#0a4d1f' : '#7d8a81'};">${s.label}</div>
      </td>`;
    }).join('');
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;"><tr>${cells}</tr></table>`;
  }

  private itemsTable(ref: string, items: OrderLine[], total: string) {
    const rows = items
      .map(
        (i) => `<tr>
          <td style="padding:8px 0;font-size:14px;color:#132018;border-bottom:1px solid #dfe8e0;"><strong>${esc(i.quantity)}×</strong> ${esc(i.name)}</td>
          <td align="right" style="padding:8px 0;font-size:14px;color:#132018;border-bottom:1px solid #dfe8e0;white-space:nowrap;">${ugx(Number(i.price) * Number(i.quantity))}</td>
        </tr>`,
      )
      .join('');
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
      <tr><td colspan="2" style="padding:0 0 6px;font-size:12px;color:#7d8a81;">Order ${esc(ref)}</td></tr>
      ${rows}
      <tr>
        <td style="padding:12px 0 0;font-size:15px;font-weight:700;color:#132018;">Total</td>
        <td align="right" style="padding:12px 0 0;font-size:17px;font-weight:700;color:#0a4d1f;">${ugx(total)}</td>
      </tr>
    </table>`;
  }

  private button(label: string, href: string) {
    return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0 0;"><tr><td style="border-radius:14px;background:#0a4d1f;">
      <a href="${esc(href)}" style="display:inline-block;padding:14px 26px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;">${esc(label)}</a>
    </td></tr></table>`;
  }

  private layout({ preheader, body }: { preheader: string; body: string }) {
    return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f7f3;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7f3;"><tr><td align="center" style="padding:24px 12px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
      <tr><td style="padding:18px 24px;background:#0a4d1f;border-radius:20px 20px 0 0;">
        <span style="font-size:20px;font-weight:800;letter-spacing:-0.3px;color:#ffffff;">Ocare</span>
        <span style="font-size:12px;color:#a7d9b4;margin-left:6px;">Transparent health</span>
      </td></tr>
      <tr><td style="padding:28px 24px 30px;background:#ffffff;border-radius:0 0 20px 20px;">${body}</td></tr>
      <tr><td align="center" style="padding:18px 12px;font-size:12px;line-height:1.6;color:#7d8a81;">
        Questions? Call or WhatsApp <a href="tel:+256759599992" style="color:#0a4d1f;">+256 759 599 992</a> or email
        <a href="mailto:info@ocareug.com" style="color:#0a4d1f;">info@ocareug.com</a><br/>© ${new Date().getFullYear()} Ocare Health, Kampala
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;
  }
}

export type { MailStage };
