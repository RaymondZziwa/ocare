import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PushService } from './push.service';
import { ChatService } from './chat.service';
import { OrderMailService, type MailStage } from './order-mail.service';
import { RefundsService, presentRefund, type RefundDestination } from './refunds.service';
import { presentPayment } from './payments.service';

export type TrackStatus = 'PACKAGING' | 'IN_DELIVERY' | 'SUCCESSFUL' | 'CANCELLED' | 'FAILED';

const STATUS_COPY: Record<TrackStatus, { state: string; title: string; body: string }> = {
  PACKAGING: { state: 'PACKAGING', title: 'Your order is being packed', body: 'Our pharmacist is preparing your order.' },
  IN_DELIVERY: { state: 'OUT_FOR_DELIVERY', title: 'Your order is on the way', body: 'Your rider has left the pharmacy.' },
  SUCCESSFUL: { state: 'DELIVERED', title: 'Order delivered', body: 'Thank you for choosing Ocare. Get well soon!' },
  CANCELLED: { state: 'CANCELLED', title: 'Order cancelled', body: 'Your order has been cancelled.' },
  FAILED: { state: 'FAILED', title: 'We could not complete your order', body: 'Please contact us so we can help.' },
};

const ACTIVE = ['PENDING', 'PACKAGING', 'IN_DELIVERY'];

@Injectable()
export class OrdersTrackingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly push: PushService,
    private readonly chat: ChatService,
    private readonly mail: OrderMailService,
    private readonly refunds: RefundsService,
  ) {}

  private include = {
    timeLine: { orderBy: { createdAt: 'asc' as const } },
    prescription: { select: { id: true, status: true } },
    appPayments: { orderBy: { createdAt: 'desc' as const }, take: 5 },
    refunds: { orderBy: { createdAt: 'desc' as const } },
  };

  /** Adds payment/refund details in the shape the app and Portal use */
  private present(sale: any) {
    const { appPayments, refunds, ...rest } = sale;
    const paid = rest.status === 'FULLY_PAID' ? Number(rest.total) : 0;
    const refunded = Number(rest.refundedAmount || 0);
    return {
      ...rest,
      total: Number(rest.total),
      subtotal: rest.subtotal != null ? Number(rest.subtotal) : null,
      deliveryFee: rest.deliveryFee != null ? Number(rest.deliveryFee) : null,
      refundedAmount: refunded,
      refundable: Math.max(0, paid - refunded),
      payments: (appPayments || []).map(presentPayment),
      refunds: (refunds || []).map(presentRefund),
    };
  }

  // ───────────── Customer ─────────────
  async listForClient(clientId: string) {
    const sales = await this.prisma.sale.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
      include: this.include,
    });
    return { status: 200, data: sales.map((s: any) => this.present(s)) };
  }

  async getForClient(clientId: string, id: string) {
    const sale = await this.prisma.sale.findUnique({ where: { id }, include: this.include });
    if (!sale) throw new NotFoundException('Order not found');
    if (sale.clientId !== clientId) throw new ForbiddenException();
    return { status: 200, data: this.present(sale) };
  }

  async cancelByClient(clientId: string, id: string, reason?: string, refundTo?: RefundDestination) {
    const sale = await this.prisma.sale.findUnique({ where: { id } });
    if (!sale) throw new NotFoundException('Order not found');
    if (sale.clientId !== clientId) throw new ForbiddenException();
    if (!['PENDING', 'AWAITING_PAYMENT'].includes(sale.saleStatus)) {
      throw new BadRequestException('This order is already being prepared. Message the pharmacist to change it.');
    }
    await this.prisma.$transaction([
      this.prisma.sale.update({ where: { id }, data: { saleStatus: 'CANCELLED' } }),
      this.prisma.saleTimeLine.create({
        data: { saleId: id, state: 'CANCELLED', note: reason?.trim() || 'Cancelled by customer' },
      }),
    ]);
    // Paid? Money back straight away (wallet = instant, mobile money = minutes)
    const refund = await this.refunds.refundOnCancel(id, {
      destination: refundTo === 'MOBILE_MONEY' ? 'MOBILE_MONEY' : 'WALLET',
      reason: reason?.trim() || 'Order cancelled by customer',
      by: 'customer',
    });
    if (sale.saleStatus !== 'AWAITING_PAYMENT') {
      void this.mail.orderUpdate(id, 'CANCELLED', { note: reason?.trim() || 'Cancelled at your request.' });
    }
    return {
      status: 200,
      message: refund ? `Order cancelled. ${refund.message}.` : 'Order cancelled',
      data: { refund: refund?.data ?? null },
    };
  }

  // ───────────── Staff ─────────────
  async listForStaff(scope: 'active' | 'all' = 'active') {
    const sales = await this.prisma.sale.findMany({
      where: {
        type: { in: ['Web', 'Mobile'] },
        ...(scope === 'active' ? { saleStatus: { in: ACTIVE as any } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: { ...this.include, client: { select: { id: true, fullName: true, phone: true, email: true } } },
    });
    return { status: 200, data: sales.map((s: any) => this.present(s)) };
  }

  async updateStatus(
    id: string,
    dto: { status: TrackStatus; note?: string; riderName?: string; riderPhone?: string; estimatedDeliveryAt?: string },
    employeeId?: string,
  ) {
    const copy = STATUS_COPY[dto.status];
    if (!copy) throw new BadRequestException('Unknown status');
    const sale = await this.prisma.sale.findUnique({ where: { id } });
    if (!sale) throw new NotFoundException('Order not found');
    if (!ACTIVE.includes(sale.saleStatus)) {
      throw new BadRequestException('This order is already closed.');
    }

    await this.prisma.$transaction([
      this.prisma.sale.update({
        where: { id },
        data: {
          saleStatus: dto.status,
          ...(dto.riderName !== undefined ? { riderName: dto.riderName || null } : {}),
          ...(dto.riderPhone !== undefined ? { riderPhone: dto.riderPhone || null } : {}),
          ...(dto.estimatedDeliveryAt ? { estimatedDeliveryAt: new Date(dto.estimatedDeliveryAt) } : {}),
          // Cash on delivery: the rider collected the money
          ...(dto.status === 'SUCCESSFUL' && sale.status !== 'FULLY_PAID' ? { status: 'FULLY_PAID', paidAt: new Date() } : {}),
        },
      }),
      this.prisma.saleTimeLine.create({ data: { saleId: id, state: copy.state, note: dto.note?.trim() || null } }),
    ]);

    const ref = `ORD-${id.slice(-8).toUpperCase()}`;
    const rider = dto.status === 'IN_DELIVERY' && dto.riderName ? ` ${dto.riderName} is bringing it.` : '';
    await this.push.notifyClient(sale.clientId, {
      title: copy.title,
      body: `${ref}: ${copy.body}${rider}`,
      route: `/order/${id}`,
    });
    await this.chat.systemNote(sale.clientId, `${ref} update: ${copy.title.toLowerCase()}.${rider}`, id);

    const mailStage: Record<TrackStatus, MailStage> = {
      PACKAGING: 'PACKAGING',
      IN_DELIVERY: 'IN_DELIVERY',
      SUCCESSFUL: 'DELIVERED',
      CANCELLED: 'CANCELLED',
      FAILED: 'FAILED',
    };
    void this.mail.orderUpdate(id, mailStage[dto.status], {
      note: dto.note,
      riderName: dto.riderName,
      riderPhone: dto.riderPhone,
      estimatedDeliveryAt: dto.estimatedDeliveryAt,
    });

    // A paid order that won't be delivered is refunded to the wallet straight away
    if (dto.status === 'CANCELLED' || dto.status === 'FAILED') {
      await this.refunds
        .refundOnCancel(id, { destination: 'WALLET', reason: dto.note?.trim() || copy.title, by: 'staff', employeeId })
        .catch(() => null);
    }

    return { status: 200, message: 'Order updated' };
  }
}
