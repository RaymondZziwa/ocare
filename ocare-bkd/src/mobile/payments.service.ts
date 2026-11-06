import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from 'src/prisma/prisma.service';
import { MarzClient, mapMarzStatus, networkFor, normaliseUgPhone } from './marz.client';
import { ClientWalletService } from './wallet.service';
import { RefundsService } from './refunds.service';
import { PushService } from './push.service';
import { OrderMailService } from './order-mail.service';

type Tx = any;

export const TOPUP_MIN = 1000;
export const TOPUP_MAX = 5_000_000;

const ugx = (n: number) => `UGX ${new Intl.NumberFormat('en-UG').format(Math.round(n))}`;
const orderRef = (id: string) => `ORD-${id.slice(-8).toUpperCase()}`;

/** What the app needs to show a payment */
export const presentPayment = (p: any) =>
  p && {
    id: p.id,
    purpose: p.purpose,
    status: p.status,
    amount: Number(p.amount),
    phone: p.phone,
    network: p.network,
    saleId: p.saleId,
    failureReason: p.failureReason,
    createdAt: p.createdAt,
    completedAt: p.completedAt,
  };

/**
 * Mobile money collections from the customer app (order payments and wallet top-ups),
 * and the Marz callback that settles them (and mobile money refunds).
 */
@Injectable()
export class AppPaymentsService {
  private readonly logger = new Logger(AppPaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly marz: MarzClient,
    private readonly wallet: ClientWalletService,
    private readonly refunds: RefundsService,
    private readonly push: PushService,
    private readonly mail: OrderMailService,
  ) {}

  // ───────────── Starting a payment ─────────────

  /** Sends an approval prompt to the customer's phone and records the payment as PENDING. */
  async startCollection(
    clientId: string,
    opts: { purpose: 'ORDER' | 'WALLET_TOPUP'; amount: number; phone: string; saleId?: string; description: string },
  ) {
    const phone = normaliseUgPhone(opts.phone);
    const amount = Math.round(opts.amount);
    if (!(amount >= 500)) throw new BadRequestException('Amount is too small for mobile money.');

    const reference = randomUUID();
    const payment = await this.prisma.appPayment.create({
      data: {
        clientId,
        purpose: opts.purpose,
        saleId: opts.saleId ?? null,
        amount,
        phone,
        network: networkFor(phone),
        reference,
      },
    });

    try {
      const started = await this.marz.collect(amount, phone, opts.description, reference);
      await this.prisma.appPayment.update({
        where: { id: payment.id },
        data: { providerUuid: started.providerUuid },
      });
      if (started.status === 'failed') {
        await this.markFailed(payment.id, started.message || 'The payment request was declined.');
      }
    } catch (err) {
      await this.prisma.appPayment.update({
        where: { id: payment.id },
        data: { status: 'FAILED', failureReason: (err as Error).message, completedAt: new Date() },
      });
      throw err;
    }

    // Remember the number for next time
    await this.prisma.client
      .updateMany({ where: { id: clientId, OR: [{ phone: null }, { phone: '' }] }, data: { phone: `0${phone.slice(3)}` } })
      .catch(() => undefined);

    return presentPayment(await this.prisma.appPayment.findUnique({ where: { id: payment.id } }));
  }

  async startTopUp(clientId: string, amount: number, phone: string) {
    const a = Math.round(Number(amount));
    if (!(a >= TOPUP_MIN)) throw new BadRequestException(`The smallest top-up is ${ugx(TOPUP_MIN)}.`);
    if (a > TOPUP_MAX) throw new BadRequestException(`The largest top-up is ${ugx(TOPUP_MAX)}.`);
    const data = await this.startCollection(clientId, {
      purpose: 'WALLET_TOPUP',
      amount: a,
      phone,
      description: 'Ocare Wallet top-up',
    });
    return { status: 200, message: 'Check your phone to approve the payment', data };
  }

  /** The app polls this while the customer approves the prompt on their phone. */
  async getForClient(clientId: string, id: string) {
    let p = await this.prisma.appPayment.findUnique({ where: { id } });
    if (!p) throw new NotFoundException('Payment not found');
    if (p.clientId !== clientId) throw new ForbiddenException();

    // If Marz's callback is late, ask Marz directly (at most every 10 seconds per payment)
    const age = Date.now() - new Date(p.createdAt).getTime();
    const sinceUpdate = Date.now() - new Date(p.updatedAt).getTime();
    if (p.status === 'PENDING' && p.providerUuid && age > 20_000 && sinceUpdate > 10_000) {
      await this.prisma.appPayment.update({ where: { id }, data: { updatedAt: new Date() } });
      const status = await this.marz.collectionStatus(p.providerUuid);
      if (status === 'successful') await this.settleSuccess(p.id, null);
      else if (status === 'failed') await this.markFailed(p.id, 'The payment was not approved.');
      p = await this.prisma.appPayment.findUnique({ where: { id } });
    }
    return { status: 200, data: presentPayment(p) };
  }

  // ───────────── Marz callback ─────────────

  async handleCallback(payload: any) {
    const tx = payload?.transaction || payload?.data?.transaction || {};
    const reference: string | undefined = tx.reference || payload?.reference;
    if (!reference) return { status: 'ignored' };
    const outcome = mapMarzStatus(tx.status || payload?.status);
    const reason: string | undefined =
      payload?.collection?.failure_reason || payload?.disbursement?.failure_reason || tx.failure_reason || payload?.message;

    const payment = await this.prisma.appPayment.findUnique({ where: { reference } });
    if (payment) {
      await this.prisma.appPayment.update({
        where: { id: payment.id },
        data: { rawCallback: payload, providerRef: tx.provider_reference || payment.providerRef },
      });
      const paidAmount = Number(payload?.collection?.amount?.total ?? payload?.collection?.amount?.raw ?? NaN);
      if (outcome === 'successful') await this.settleSuccess(payment.id, Number.isFinite(paidAmount) ? paidAmount : null);
      else if (outcome === 'failed') await this.markFailed(payment.id, reason || 'The payment was not approved.');
      return { status: 'ok' };
    }

    const handled = await this.refunds.handleMobileMoneyCallback(reference, outcome, reason);
    if (handled) return { status: 'ok' };

    this.logger.warn(`Marz callback for unknown reference ${reference}`);
    return { status: 'unknown_reference' };
  }

  // ───────────── Settling ─────────────

  /**
   * Marks a collection as paid exactly once, then applies it:
   * order → paid and sent to the pharmacy; top-up → wallet credited.
   * If the order was already paid another way or was cancelled, the money goes to the wallet.
   */
  async settleSuccess(paymentId: string, reportedAmount: number | null) {
    const result = await this.prisma.$transaction(async (tx: Tx) => {
      const claimed = await tx.appPayment.updateMany({
        where: { id: paymentId, status: { not: 'SUCCESSFUL' } },
        data: { status: 'SUCCESSFUL', completedAt: new Date(), failureReason: null },
      });
      if (claimed.count !== 1) return null; // already settled (duplicate callback)

      const p = await tx.appPayment.findUnique({ where: { id: paymentId } });
      const amount = reportedAmount && reportedAmount > 0 ? Math.min(reportedAmount, Number(p.amount)) : Number(p.amount);
      await this.bumpCompanyWallet(tx, amount);

      if (p.purpose === 'WALLET_TOPUP') {
        await this.wallet.credit(tx, p.clientId, {
          type: 'TOPUP',
          amount,
          description: `Top-up from ${p.network || 'mobile money'} ${p.phone}`,
          paymentId: p.id,
        });
        return { kind: 'topup' as const, p, amount };
      }

      const sale = p.saleId ? await tx.sale.findUnique({ where: { id: p.saleId } }) : null;
      const canApply = sale && sale.status !== 'FULLY_PAID' && ['AWAITING_PAYMENT', 'PENDING'].includes(sale.saleStatus);
      if (!canApply || amount < Number(sale.total)) {
        await this.wallet.credit(tx, p.clientId, {
          type: 'REFUND',
          amount,
          description: sale
            ? `Payment for ${orderRef(sale.id)} returned to your wallet (order already paid or closed)`
            : 'Mobile money payment returned to your wallet',
          paymentId: p.id,
          saleId: sale?.id,
        });
        return { kind: 'returned' as const, p, amount, sale };
      }

      const wasAwaiting = sale.saleStatus === 'AWAITING_PAYMENT';
      await this.markOrderPaid(tx, sale.id, `Paid ${ugx(amount)} by ${p.network || 'mobile money'} (${p.phone})`);
      return { kind: 'order' as const, p, amount, sale, wasAwaiting };
    });

    if (!result) return;
    const { p, amount } = result;
    if (result.kind === 'topup') {
      void this.push.notifyClient(p.clientId, {
        title: 'Wallet topped up',
        body: `${ugx(amount)} was added to your Ocare Wallet.`,
        route: '/wallet',
      });
      void this.mail.notice(p.clientId, {
        subject: 'Your Ocare Wallet was topped up',
        headline: 'Top-up received',
        amount,
        body: 'The money is in your Ocare Wallet and ready to pay for your next order.',
        path: '/wallet',
        buttonLabel: 'Open my wallet',
      });
    } else if (result.kind === 'returned') {
      void this.push.notifyClient(p.clientId, {
        title: 'Payment added to your wallet',
        body: `${ugx(amount)} was added to your Ocare Wallet.`,
        route: '/wallet',
      });
    } else {
      void this.push.notifyClient(p.clientId, {
        title: 'Payment received',
        body: `${orderRef(result.sale.id)} is paid. Our pharmacist is on it.`,
        route: `/order/${result.sale.id}`,
      });
      if (result.wasAwaiting) void this.mail.orderUpdate(result.sale.id, 'RECEIVED');
    }
  }

  async markFailed(paymentId: string, reason: string) {
    const res = await this.prisma.appPayment.updateMany({
      where: { id: paymentId, status: 'PENDING' },
      data: { status: 'FAILED', failureReason: reason.slice(0, 250), completedAt: new Date() },
    });
    if (res.count !== 1) return;
    const p = await this.prisma.appPayment.findUnique({ where: { id: paymentId } });
    void this.push.notifyClient(p.clientId, {
      title: "Payment didn't go through",
      body:
        p.purpose === 'ORDER'
          ? 'Your order is saved. Open it to try again or pay another way.'
          : 'Your wallet top-up was not completed. You can try again.',
      route: p.purpose === 'ORDER' && p.saleId ? `/order/${p.saleId}` : '/wallet',
    });
  }

  /** Marks an order as paid and, if it was waiting for payment, releases it to the pharmacy. */
  async markOrderPaid(tx: Tx, saleId: string, note: string) {
    const sale = await tx.sale.findUnique({ where: { id: saleId } });
    await tx.sale.update({
      where: { id: saleId },
      data: {
        status: 'FULLY_PAID',
        paidAt: new Date(),
        ...(sale.saleStatus === 'AWAITING_PAYMENT' ? { saleStatus: 'PENDING' } : {}),
      },
    });
    await tx.saleTimeLine.create({ data: { saleId, state: 'PAID', note } });
    if (sale.saleStatus === 'AWAITING_PAYMENT') {
      await tx.saleTimeLine.create({ data: { saleId, state: 'CONFIRMED', note: null } });
    }
  }

  /** Keeps the company's "app sales" wallet in step with money received (if that wallet exists). */
  private async bumpCompanyWallet(tx: Tx, amount: number) {
    const w = await tx.wallet.findFirst({ where: { isForAppSales: true } });
    if (w) await tx.wallet.update({ where: { id: w.id }, data: { balance: { increment: amount } } });
  }
}
