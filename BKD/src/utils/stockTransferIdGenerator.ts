import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Generates a unique 8-character alphanumeric transfer ID.
 * Automatically checks the database to ensure it doesn't exist.
 */
export async function generateUniqueTransferId(): Promise<string> {
  const generateRandomId = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length: 8 }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length)),
    ).join('');
  };

  let transferId: string;
  let exists = true;

  // Keep generating until a unique one is found
  do {
    transferId = generateRandomId();
    const existing = await prisma.inventoryRecord.findFirst({
      where: { transferId },
      select: { id: true },
    });
    exists = !!existing;
  } while (exists);

  return transferId;
}
