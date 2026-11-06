import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from 'src/prisma/prisma.service';
import { MarzClient, type MarzStatus, normaliseUgPhone } from './marz.client';
import { ClientWalletService } from './wallet.service';
import { PushService } from './push.service';
import { OrderMailService } from './order-mail.service';

type Tx = any;
export type RefundDestination = 'WALLET' | 'MOBILE_MONEY';

const ugx = (n: number) => `UGX ${new Intl.NumberFormat('en-UG').format(Math.round(n))}`;
const orderRef = (id: string) => `ORD-${id.slice(-8).toUpperCase()}`;

export const presentRefund = (r: any) => ({
  id: r.id,
  saleId: r.saleId,
  amount: Number(r.amount),
  destination: r.destination,
  phone: r.phone,
  reason: r.reason,
  status: r.status,
  failureReason: r.failureReason,
  requestedBy: r.requestedBy,
  createdAt: r.createdAt,
  completedAt: r.completedAt,
});

export interface RefundRequest {
  saleId: string;
  amount?: number; // defaults to everything still refundable
  destination: RefundDestination;
  reason: string;
  requestedBy: 'customer' | 'staff' | 'system';
  employeeId?: string | null;
  phone?: string | null;
  /** If mobile money can't be started, put the money in the wallet instead of failing */
  fallbackToWallet?: boolean;
}

/**
 * Fast refunds for paid app and website orders.
 *  - To the Ocare Wallet: instant, in one database transaction.
 *  - To mobile money: sent through Marz; if Marz reports a failure the money
 *    automatically lands in the customer's wallet so nobody is left waiting.
 */
@Injectable()
export class RefundsService {
  private readonly logger = new Logger(RefundsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly marz: MarzClient,
    private readonly wallet: ClientWalletService,
    private readonly push: PushService,
    private readonly mail: OrderMailService,
  ) {}

  /** How much of an order can still be refunded */
  async refundable(saleId: string) {
    const sale = await this.prisma.sale.findUnique({ where: { id: saleId } });
    if (!sale) throw new NotFoundException('Order not found');
    const paid = sale.status === 'FULLY_PAID' ? Number(sale.total) : 0;
    return { sale, paid, refunded: Number(sale.refundedAmount || 0), available: Math.max(0, paid - Number(sale.refundedAmount || 0)) };
  }

  async refund(req: RefundRequest) {
    const reason = (req.reason || '').trim();
    if (!reason) throw new BadRequestException('Give a reason for the refund');
    if (!['WALLET', 'MOBILE_MONEY'].includes(req.destination)) throw new BadRequestException('Choose where the refund goes');

    const { sale, available } = await this.refundable(req.saleId);
    if (!['Mobile', 'Web'].includes(sale.type)) throw new BadRequestException('Only app and website orders can be refunded here');
    if (available <= 0) throw new BadRequestException('Nothing left to refund on this order');
    const amount = Math.round(req.amount ?? available);
    if (!(amount > 0)) throw new BadRequestException('Refund amount must be more than zero');
    if (amount > available) throw new BadRequestException(`You can refund at most ${ugx(available)} on this order`);

    if (req.destination === 'WALLET') return this.refundToWallet(sale, amount, reason, req);

    // ── Mobile money ──
    let phone: string;
    try {
      const lastPayment = await this.prisma.appPayment.findFirst({
        where: { saleId: sale.id, status: 'SUCCESSFUL' },
        orderBy: { completedAt: 'desc' },
      });
      const client = await this.prisma.client.findUnique({ where: { id: sale.clientId }, select: { phone: true } });
      phone = normaliseUgPhone(req.phone || lastPayment?.phone || client?.phone || '');
    } catch (err) {
      if (req.fallbackToWallet) return this.refundToWallet(sale, amount, reason, req);
      throw err;
    }

    const reference = randomUUID();
    // Reserve the amount so two refunds can't exceed what was paid
    const refund = await this.prisma.$transaction(async (tx: Tx) => {
      const ok = await tx.sale.updateMany({
        where: { id: sale.id, refundedAmount: { lte: Number(sale.total) - amount } },
        data: { refundedAmount: { increment: amount } },
      });
      if (ok.count !== 1) throw new BadRequestException('This order was refunded in the meantime. Refresh and try again.');
      return tx.refund.create({
        data: {
          saleId: sale.id,
          clientId: sale.clientId,
          amount,
          destination: 'MOBILE_MONEY',
          phone,
          reason,
          status: 'PROCESSING',
          reference,
          requestedBy: req.requestedBy,
          employeeId: req.employeeId ?? null,
        },
      });
    });

    try {
      const started = await this.marz.send(amount, phone, `Ocare refund ${orderRef(sale.id)}`, reference);
      if (started.status === 'failed') await this.failMobileRefund(refund.id, started.message || 'Declined by mobile money');
      else if (started.status === 'successful') await this.completeMobileRefund(refund.id);
    } catch (err) {
      // Could not even start: undo the reservation, then fall back or report
      await this.prisma.$transaction([
        this.prisma.refund.update({
          where: { id: refund.id },
          data: { status: 'FAILED', failureReason: (err as Error).message, completedAt: new Date() },
        }),
        this.prisma.sale.update({ where: { id: sale.id }, data: { refundedAmount: { decrement: amount } } }),
      ]);
      if (req.fallbackToWallet) {
        const fresh = await this.prisma.sale.findUnique({ where: { id: sale.id } });
        return this.refundToWallet(fresh, amount, `${reason} (sent to wallet: mobile money unavailable)`, req);
      }
      throw err;
    }

    await this.prisma.saleTimeLine.create({
      data: { saleId: sale.id, state: 'REFUND', note: `Refund of ${ugx(amount)} being sent to ${phone.replace(/^256/, '0')}` },
    });
    void this.push.notifyClient(sale.clientId, {
      title: 'Refund on its way',
      body: `${ugx(amount)} for ${orderRef(sale.id)} is being sent to your mobile money.`,
      route: `/order/${sale.id}`,
    });
    const latest = await this.prisma.refund.findUnique({ where: { id: refund.id } });
    return { status: 200, message: 'Refund is being sent to mobile money', data: presentRefund(latest) };
  }

  private async refundToWallet(sale: any, amount: number, reason: string, req: RefundRequest) {
    const refund = await this.prisma.$transaction(async (tx: Tx) => {
      const ok = await tx.sale.updateMany({
        where: { id: sale.id, refundedAmount: { lte: Number(sale.total) - amount } },
        data: { refundedAmount: { increment: amount } },
      });
      if (ok.count !== 1) throw new BadRequestException('This order was refunded in the meantime. Refresh and try again.');
      const r = await tx.refund.create({
        data: {
          saleId: sale.id,
          clientId: sale.clientId,
          amount,
          destination: 'WALLET',
          reason,
          status: 'COMPLETED',
          requestedBy: req.requestedBy,
          employeeId: req.employeeId ?? null,
          completedAt: new Date(),
        },
      });
      await this.wallet.credit(tx, sale.clientId, {
        type: 'REFUND',
        amount,
        description: `Refund for ${orderRef(sale.id)}`,
        saleId: sale.id,
        refundId: r.id,
      });
      await tx.saleTimeLine.create({
        data: { saleId: sale.id, state: 'REFUND', note: `Refund of ${ugx(amount)} added to Ocare Wallet` },
      });
      return r;
    });

    void this.push.notifyClient(sale.clientId, {
      title: 'Refund in your wallet',
      body: `${ugx(amount)} for ${orderRef(sale.id)} is in your Ocare Wallet now.`,
      route: '/wallet',
    });
    void this.mail.notice(sale.clientId, {
      subject: `Refund for ${orderRef(sale.id)}`,
      headline: 'Your refund is in your Ocare Wallet',
      amount,
      body: `We refunded ${ugx(amount)} for order ${orderRef(sale.id)}. It's available right away to pay for your next order.`,
      path: '/wallet',
      buttonLabel: 'Open my wallet',
    });
    return { status: 200, message: 'Refunded to Ocare Wallet', data: presentRefund(refund) };
  }

  /** Called from the Marz callback. Returns false if the reference isn't a refund. */
  async handleMobileMoneyCallback(reference: string, outcome: MarzStatus, reason?: string) {
    const refund = await this.prisma.refund.findUnique({ where: { reference } });
    if (!refund) return false;
    if (outcome === 'successful') await this.completeMobileRefund(refund.id);
    else if (outcome === 'failed') await this.failMobileRefund(refund.id, reason || 'Mobile money transfer failed');
    return true;
  }

  private async completeMobileRefund(refundId: string) {
    const res = await this.prisma.refund.updateMany({
      where: { id: refundId, status: 'PROCESSING' },
      data: { status: 'COMPLETED', completedAt: new Date() },
    });
    if (res.count !== 1) return;
    const r = await this.prisma.refund.findUnique({ where: { id: refundId } });
    const w = await this.prisma.wallet.findFirst({ where: { isForAppSales: true } });
    if (w) await this.prisma.wallet.update({ where: { id: w.id }, data: { balance: { decrement: Number(r.amount) } } });
    void this.push.notifyClient(r.clientId, {
      title: 'Refund sent',
      body: `${ugx(Number(r.amount))} was sent to ${String(r.phone).replace(/^256/, '0')}.`,
      route: `/order/${r.saleId}`,
    });
    void this.mail.notice(r.clientId, {
      subject: `Refund for ${orderRef(r.saleId)}`,
      headline: 'Your refund was sent to your mobile money',
      amount: Number(r.amount),
      body: `We sent ${ugx(Number(r.amount))} to ${String(r.phone).replace(/^256/, '0')} for order ${orderRef(r.saleId)}.`,
      path: `/order/${r.saleId}`,
      buttonLabel: 'View order',
    });
  }

  /** Mobile money refund failed → the customer still gets their money, in the wallet. */
  private async failMobileRefund(refundId: string, reason: string) {
    const res = await this.prisma.refund.updateMany({
      where: { id: refundId, status: 'PROCESSING' },
      data: { status: 'FAILED', failureReason: reason.slice(0, 250), completedAt: new Date() },
    });
    if (res.count !== 1) return;
    const r = await this.prisma.refund.findUnique({ where: { id: refundId } });
    await this.prisma.sale.update({ where: { id: r.saleId }, data: { refundedAmount: { decrement: Number(r.amount) } } });
    const sale = await this.prisma.sale.findUnique({ where: { id: r.saleId } });
    this.logger.warn(`Mobile money refund ${refundId} failed (${reason}); refunding to wallet instead`);
    await this.refundToWallet(sale, Number(r.amount), `${r.reason} (mobile money failed, sent to wallet)`, {
      saleId: r.saleId,
      destination: 'WALLET',
      reason: r.reason,
      requestedBy: 'system',
      employeeId: r.employeeId,
    });
  }

  /** Paid order was cancelled → refund whatever hasn't been refunded yet. */
  async refundOnCancel(saleId: string, opts: { destination?: RefundDestination; reason: string; by: 'customer' | 'staff' | 'system'; employeeId?: string | null }) {
    const { sale, available } = await this.refundable(saleId);
    if (!sale || available <= 0) return null;
    return this.refund({
      saleId,
      destination: opts.destination || 'WALLET',
      reason: opts.reason,
      requestedBy: opts.by,
      employeeId: opts.employeeId,
      fallbackToWallet: true,
    });
  }

  async listForSale(saleId: string) {
    const rows = await this.prisma.refund.findMany({ where: { saleId }, orderBy: { createdAt: 'desc' } });
    return rows.map(presentRefund);
  }

  async listForStaff(take = 200) {
    const rows = await this.prisma.refund.findMany({
      orderBy: { createdAt: 'desc' },
      take,
      include: { client: { select: { fullName: true, phone: true, email: true } } },
    });
    return {
      status: 200,
      data: rows.map((r: any) => ({ ...presentRefund(r), client: r.client, orderRef: orderRef(r.saleId) })),
    };
  }
}
