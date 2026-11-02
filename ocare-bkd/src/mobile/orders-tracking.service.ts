import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PushService } from './push.service';
import { ChatService } from './chat.service';
import { OrderMailService, type MailStage } from './order-mail.service';

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
  ) {}

  private include = {
    timeLine: { orderBy: { createdAt: 'asc' as const } },
    prescription: { select: { id: true, status: true } },
  };

  // ───────────── Customer ─────────────
  async listForClient(clientId: string) {
    const sales = await this.prisma.sale.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
      include: this.include,
    });
    return { status: 200, data: sales };
  }

  async getForClient(clientId: string, id: string) {
    const sale = await this.prisma.sale.findUnique({ where: { id }, include: this.include });
    if (!sale) throw new NotFoundException('Order not found');
    if (sale.clientId !== clientId) throw new ForbiddenException();
    return { status: 200, data: sale };
  }

  async cancelByClient(clientId: string, id: string, reason?: string) {
    const sale = await this.prisma.sale.findUnique({ where: { id } });
    if (!sale) throw new NotFoundException('Order not found');
    if (sale.clientId !== clientId) throw new ForbiddenException();
    if (sale.saleStatus !== 'PENDING') {
      throw new BadRequestException('This order is already being prepared. Message the pharmacist to change it.');
    }
    await this.prisma.$transaction([
      this.prisma.sale.update({ where: { id }, data: { saleStatus: 'CANCELLED' } }),
      this.prisma.saleTimeLine.create({
        data: { saleId: id, state: 'CANCELLED', note: reason?.trim() || 'Cancelled by customer' },
      }),
    ]);
    void this.mail.orderUpdate(id, 'CANCELLED', { note: reason?.trim() || 'Cancelled at your request.' });
    return { status: 200, message: 'Order cancelled' };
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
    return { status: 200, data: sales };
  }

  async updateStatus(
    id: string,
    dto: { status: TrackStatus; note?: string; riderName?: string; riderPhone?: string; estimatedDeliveryAt?: string },
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

    return { status: 200, message: 'Order updated' };
  }
}
