import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // adjust path

@Injectable()
export class StockTransferIdGeneratorService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generates a unique 8-character alphanumeric transfer ID.
   * Automatically checks the database to ensure it doesn't exist.
   */
  async generateUniqueTransferId(): Promise<string> {
    const generateRandomId = (): string => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      return Array.from({ length: 8 }, () =>
        chars.charAt(Math.floor(Math.random() * chars.length)),
      ).join('');
    };

    let transferId: string;
    let exists = true;

    do {
      transferId = generateRandomId();
      const existing = await this.prisma.inventoryRecord.findFirst({
        where: { transferId },
        select: { id: true },
      });
      exists = !!existing;
    } while (exists);

    return transferId;
  }
}
