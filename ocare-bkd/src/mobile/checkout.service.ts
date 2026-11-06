import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrescriptionsService } from './prescriptions.service';
import { AppPaymentsService, presentPayment } from './payments.service';
import { ClientWalletService } from './wallet.service';
import { OrderMailService } from './order-mail.service';
import { normaliseUgPhone } from './marz.client';
import {
  DELIVERY_FEE,
  DELIVERY_RADIUS_KM,
  KAMPALA_AREAS,
  checkDeliveryZone,
  deliverySchedule,
} from './delivery-rules';

type Tx = any;
export type PayMethod = 'MOBILE_MONEY' | 'WALLET' | 'CASH_ON_DELIVERY';

const METHOD_LABEL: Record<PayMethod, string> = {
  MOBILE_MONEY: 'Mobile money',
  WALLET: 'Ocare Wallet',
  CASH_ON_DELIVERY: 'Cash on delivery',
};

export interface CheckoutDto {
  items: Array<{ id: string; quantity: number; unitId?: string }>;
  addressId?: string | null;
  newAddress?: {
    area: string;
    street: string;
    landmark?: string;
    label?: string;
    latitude?: number | null;
    longitude?: number | null;
  } | null;
  paymentMethod: PayMethod;
  phone?: string;
  notes?: string;
  prescriptionId?: string | null;
  source?: 'Mobile' | 'Web';
}

const ugx = (n: number) => `UGX ${new Intl.NumberFormat('en-UG').format(Math.round(n))}`;

/**
 * Places app and website orders: checks the Kampala delivery zone, prices items from the
 * database (never from the phone), adds the flat delivery fee, schedules late-night orders
 * for the morning, and takes payment by mobile money, Ocare Wallet or cash on delivery.
 */
@Injectable()
export class CheckoutService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly prescriptions: PrescriptionsService,
    private readonly payments: AppPaymentsService,
    private readonly wallet: ClientWalletService,
    private readonly mail: OrderMailService,
  ) {}

  /** Everything the checkout screen needs before the customer chooses */
  async info(clientId: string) {
    const schedule = deliverySchedule();
    return {
      status: 200,
      data: {
        deliveryFee: DELIVERY_FEE(),
        radiusKm: DELIVERY_RADIUS_KM(),
        areas: KAMPALA_AREAS,
        schedule: { lateNight: schedule.lateNight, when: schedule.when, scheduledFor: schedule.scheduledFor, message: schedule.message },
        walletBalance: await this.wallet.balance(clientId),
        mobileMoneyEnabled: Boolean(process.env.MARZ_AUTH_HEADER && process.env.MARZ_COLLECTION_BASE_URL),
      },
    };
  }

  /** Checks a location or area before the customer commits to it */
  checkZone(input: { latitude?: number; longitude?: number; area?: string }) {
    const zone = checkDeliveryZone({ village: input.area, latitude: input.latitude, longitude: input.longitude });
    return { status: 200, data: { ...zone, deliveryFee: DELIVERY_FEE() } };
  }

  async placeOrder(clientId: string, dto: CheckoutDto) {
    const method = dto.paymentMethod;
    if (!METHOD_LABEL[method]) throw new BadRequestException('Choose how you want to pay');
    const lines = (dto.items || []).filter((l) => l && l.id);
    if (!lines.length) throw new BadRequestException('Your cart is empty');
    for (const l of lines) {
      if (!Number.isInteger(Number(l.quantity)) || Number(l.quantity) < 1 || Number(l.quantity) > 100) {
        throw new BadRequestException('Check the quantities in your cart');
      }
    }
    if (method === 'MOBILE_MONEY') normaliseUgPhone(dto.phone || ''); // fail fast on a bad number

    // ── Prices come from the database ──
    const itemIds = [...new Set(lines.map((l) => String(l.id)))];
    const dbItems = await this.prisma.item.findMany({
      where: { id: { in: itemIds } },
      select: { id: true, name: true, sellingPrice: true, unitId: true },
    });
    const byId = new Map<string, any>(dbItems.map((i: any) => [i.id, i]));
    const saleItems = lines.map((l) => {
      const item = byId.get(String(l.id));
      if (!item) throw new BadRequestException('An item in your cart is no longer available. Remove it and try again.');
      const price = Number(item.sellingPrice);
      const quantity = Number(l.quantity);
      return { id: item.id, name: item.name, price, quantity, unitId: l.unitId || item.unitId, total: price * quantity };
    });
    const subtotal = saleItems.reduce((s, i) => s + i.total, 0);
    const deliveryFee = DELIVERY_FEE();
    const total = subtotal + deliveryFee;

    // ── Prescription-only medicines ──
    const prescriptionId = await this.prescriptions.assertCovers(clientId, dto.prescriptionId ?? undefined, itemIds);

    // ── Delivery address (Kampala only) ──
    const deliveryAddress = await this.resolveAddress(clientId, dto);

    // ── Stock in the store that serves app & web orders ──
    const store = await this.prisma.store.findFirst({ where: { isForAppSales: true } });
    if (!store) throw new BadRequestException('Online orders are paused right now. Please try again later.');
    const inventories = await this.prisma.productInventory.findMany({
      where: { storeId: store.id, OR: saleItems.map((i) => ({ itemId: i.id, unitId: i.unitId })) },
    });
    const stock = new Map<string, number>(inventories.map((inv: any) => [`${inv.itemId}-${inv.unitId}`, Number(inv.qty)]));
    for (const i of saleItems) {
      const qty = stock.get(`${i.id}-${i.unitId}`) ?? 0;
      if (qty < i.quantity) {
        throw new BadRequestException(
          qty > 0 ? `Only ${qty} of "${i.name}" left. Reduce the quantity and try again.` : `"${i.name}" is out of stock.`,
        );
      }
    }

    if (method === 'WALLET') {
      const balance = await this.wallet.balance(clientId);
      if (balance < total) {
        throw new BadRequestException(
          `Your Ocare Wallet has ${ugx(balance)}. Top up ${ugx(total - balance)} more or choose mobile money.`,
        );
      }
    }

    const schedule = deliverySchedule();
    const notes = (dto.notes || '').trim().slice(0, 500) || null;

    // ── Create the order (and take wallet payment in the same transaction) ──
    const sale = await this.prisma.$transaction(async (tx: Tx) => {
      const created = await tx.sale.create({
        data: {
          clientId,
          type: dto.source === 'Web' ? 'Web' : 'Mobile',
          storeId: store.id,
          status: 'UNPAID',
          saleStatus: method === 'MOBILE_MONEY' ? 'AWAITING_PAYMENT' : 'PENDING',
          total,
          subtotal,
          deliveryFee,
          paymentMethod: METHOD_LABEL[method],
          notes,
          items: saleItems,
          prescriptionId,
          deliveryAddress,
          scheduledFor: schedule.scheduledFor,
        },
      });
      if (schedule.message) {
        await tx.saleTimeLine.create({ data: { saleId: created.id, state: 'SCHEDULED', note: schedule.message } });
      }
      if (method === 'WALLET') {
        await this.wallet.debit(tx, clientId, {
          type: 'PAYMENT',
          amount: total,
          description: `Payment for ORD-${created.id.slice(-8).toUpperCase()}`,
          saleId: created.id,
        });
        await this.payments.markOrderPaid(tx, created.id, `Paid ${ugx(total)} from Ocare Wallet`);
        await tx.saleTimeLine.create({ data: { saleId: created.id, state: 'CONFIRMED', note: null } });
      }
      if (method === 'CASH_ON_DELIVERY') {
        await tx.saleTimeLine.create({ data: { saleId: created.id, state: 'CONFIRMED', note: 'Pay the rider on delivery' } });
      }
      return created;
    });

    // ── Mobile money: send the prompt to the phone ──
    let payment: any = null;
    let paymentError: string | null = null;
    if (method === 'MOBILE_MONEY') {
      try {
        payment = await this.payments.startCollection(clientId, {
          purpose: 'ORDER',
          amount: total,
          phone: dto.phone!,
          saleId: sale.id,
          description: `Ocare order ORD-${sale.id.slice(-8).toUpperCase()}`,
        });
      } catch (err) {
        paymentError = (err as Error).message || 'We could not start the mobile money payment.';
      }
    } else {
      void this.mail.orderUpdate(sale.id, 'RECEIVED');
    }

    const fresh = await this.prisma.sale.findUnique({ where: { id: sale.id } });
    return {
      status: 200,
      message:
        method === 'MOBILE_MONEY'
          ? paymentError
            ? 'Order saved. The payment could not be started.'
            : 'Approve the payment on your phone'
          : 'Order placed',
      data: { order: this.presentOrder(fresh), payment, paymentError, schedule: { message: schedule.message, when: schedule.when } },
    };
  }

  /** Pay (again) for an order that is waiting for payment */
  async payOrder(clientId: string, saleId: string, dto: { method: PayMethod; phone?: string }) {
    const sale = await this.prisma.sale.findUnique({ where: { id: saleId } });
    if (!sale) throw new NotFoundException('Order not found');
    if (sale.clientId !== clientId) throw new ForbiddenException();
    if (sale.saleStatus !== 'AWAITING_PAYMENT' || sale.status === 'FULLY_PAID') {
      throw new BadRequestException('This order is not waiting for payment.');
    }
    const total = Number(sale.total);

    if (dto.method === 'MOBILE_MONEY') {
      const data = await this.payments.startCollection(clientId, {
        purpose: 'ORDER',
        amount: total,
        phone: dto.phone || '',
        saleId,
        description: `Ocare order ORD-${saleId.slice(-8).toUpperCase()}`,
      });
      return { status: 200, message: 'Approve the payment on your phone', data: { payment: data } };
    }

    if (dto.method === 'WALLET') {
      await this.prisma.$transaction(async (tx: Tx) => {
        await this.wallet.debit(tx, clientId, {
          type: 'PAYMENT',
          amount: total,
          description: `Payment for ORD-${saleId.slice(-8).toUpperCase()}`,
          saleId,
        });
        await tx.sale.update({ where: { id: saleId }, data: { paymentMethod: METHOD_LABEL.WALLET } });
        await this.payments.markOrderPaid(tx, saleId, `Paid ${ugx(total)} from Ocare Wallet`);
      });
    } else if (dto.method === 'CASH_ON_DELIVERY') {
      await this.prisma.$transaction([
        this.prisma.sale.update({
          where: { id: saleId },
          data: { saleStatus: 'PENDING', paymentMethod: METHOD_LABEL.CASH_ON_DELIVERY },
        }),
        this.prisma.saleTimeLine.create({ data: { saleId, state: 'CONFIRMED', note: 'Pay the rider on delivery' } }),
      ]);
    } else {
      throw new BadRequestException('Choose how you want to pay');
    }
    void this.mail.orderUpdate(saleId, 'RECEIVED');
    return { status: 200, message: 'Order placed', data: { payment: null } };
  }

  presentOrder(s: any) {
    return {
      id: s.id,
      ref: `ORD-${s.id.slice(-8).toUpperCase()}`,
      saleStatus: s.saleStatus,
      status: s.status,
      total: Number(s.total),
      subtotal: s.subtotal != null ? Number(s.subtotal) : null,
      deliveryFee: s.deliveryFee != null ? Number(s.deliveryFee) : null,
      paymentMethod: s.paymentMethod,
      scheduledFor: s.scheduledFor,
      createdAt: s.createdAt,
    };
  }

  private async resolveAddress(clientId: string, dto: CheckoutDto) {
    if (dto.addressId) {
      const addr = await this.prisma.address.findUnique({ where: { id: dto.addressId } });
      if (!addr || addr.clientId !== clientId) throw new BadRequestException('Choose a delivery address');
      const zone = checkDeliveryZone(addr);
      if (!zone.inZone) {
        throw new BadRequestException(
          `${addr.village}, ${addr.town} is outside our delivery area. We only deliver in and around Kampala.`,
        );
      }
      return {
        label: addr.label,
        town: addr.town,
        village: addr.village,
        landmark: addr.landmark,
        latitude: addr.latitude ?? null,
        longitude: addr.longitude ?? null,
      };
    }

    const n = dto.newAddress;
    if (!n?.area?.trim() || !n?.street?.trim()) throw new BadRequestException('Add your area and street for delivery');
    const zone = checkDeliveryZone({ village: n.area, latitude: n.latitude, longitude: n.longitude });
    if (!zone.inZone) throw new BadRequestException(zone.reason || 'We only deliver in and around Kampala.');

    const saved = await this.prisma.address.create({
      data: {
        clientId,
        label: n.label?.trim() || 'Delivery address',
        town: n.area.trim(),
        village: n.street.trim(),
        landmark: n.landmark?.trim() || null,
        latitude: n.latitude ?? null,
        longitude: n.longitude ?? null,
      },
    });
    return {
      label: saved.label,
      town: saved.town,
      village: saved.village,
      landmark: saved.landmark,
      latitude: saved.latitude,
      longitude: saved.longitude,
    };
  }
}
