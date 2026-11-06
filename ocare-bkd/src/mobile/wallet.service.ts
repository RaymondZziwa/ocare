import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

type Tx = any; // Prisma transaction client

export type WalletEntryType = 'TOPUP' | 'PAYMENT' | 'REFUND' | 'ADJUSTMENT';

interface EntryInput {
  type: WalletEntryType;
  amount: number; // always positive; direction comes from credit/debit
  description: string;
  saleId?: string | null;
  paymentId?: string | null;
  refundId?: string | null;
}

/**
 * The customer's Ocare Wallet. Every balance change writes a ledger entry in the
 * same database transaction, and debits can never take the balance below zero.
 */
@Injectable()
export class ClientWalletService {
  constructor(private readonly prisma: PrismaService) {}

  async ensure(tx: Tx, clientId: string) {
    return tx.clientWallet.upsert({ where: { clientId }, create: { clientId }, update: {} });
  }

  async credit(tx: Tx, clientId: string, entry: EntryInput) {
    const amount = Math.round(entry.amount);
    if (!(amount > 0)) throw new BadRequestException('Amount must be more than zero');
    const wallet = await this.ensure(tx, clientId);
    const updated = await tx.clientWallet.update({
      where: { id: wallet.id },
      data: { balance: { increment: amount } },
    });
    return tx.walletEntry.create({
      data: {
        walletId: wallet.id,
        type: entry.type,
        amount,
        balanceAfter: updated.balance,
        description: entry.description,
        saleId: entry.saleId ?? null,
        paymentId: entry.paymentId ?? null,
        refundId: entry.refundId ?? null,
      },
    });
  }

  async debit(tx: Tx, clientId: string, entry: EntryInput) {
    const amount = Math.round(entry.amount);
    if (!(amount > 0)) throw new BadRequestException('Amount must be more than zero');
    const wallet = await this.ensure(tx, clientId);
    // Conditional update: only succeeds if there is enough money, even with two taps at once
    const res = await tx.clientWallet.updateMany({
      where: { id: wallet.id, balance: { gte: amount } },
      data: { balance: { decrement: amount } },
    });
    if (res.count !== 1) {
      throw new BadRequestException('Your Ocare Wallet balance is too low for this order. Top up or choose mobile money.');
    }
    const updated = await tx.clientWallet.findUnique({ where: { id: wallet.id } });
    return tx.walletEntry.create({
      data: {
        walletId: wallet.id,
        type: entry.type,
        amount: -amount,
        balanceAfter: updated.balance,
        description: entry.description,
        saleId: entry.saleId ?? null,
        paymentId: entry.paymentId ?? null,
        refundId: entry.refundId ?? null,
      },
    });
  }

  async balance(clientId: string) {
    const w = await this.prisma.clientWallet.findUnique({ where: { clientId } });
    return Number(w?.balance ?? 0);
  }

  async overview(clientId: string, take = 50) {
    const wallet = await this.prisma.clientWallet.findUnique({
      where: { clientId },
      include: { entries: { orderBy: { createdAt: 'desc' }, take } },
    });
    const pendingTopUps = await this.prisma.appPayment.findMany({
      where: { clientId, purpose: 'WALLET_TOPUP', status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, amount: true, createdAt: true },
    });
    return {
      status: 200,
      data: {
        balance: Number(wallet?.balance ?? 0),
        entries: (wallet?.entries ?? []).map((e: any) => ({
          id: e.id,
          type: e.type,
          amount: Number(e.amount),
          balanceAfter: Number(e.balanceAfter),
          description: e.description,
          saleId: e.saleId,
          createdAt: e.createdAt,
        })),
        pendingTopUps: pendingTopUps.map((p: any) => ({ id: p.id, amount: Number(p.amount), createdAt: p.createdAt })),
      },
    };
  }
}
