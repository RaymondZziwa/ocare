// src/inventory/stockMovement/import.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { parseStockExcel, StockImportRow } from '../../utils/stockImportExcelHelper';
import { InventoryRecordCategory } from '@prisma/client';
import { StockMovementService } from './stockMovement.service'; // adjust path

@Injectable()
export class InventoryService {
  constructor(
    private prisma: PrismaService,
    private stockMvtService: StockMovementService, // inject the service that has create()
  ) {}

  async importStockFromExcel(
    fileBuffer: Buffer,
    storeId: string,
    employeeId: string,
  ): Promise<{ total: number; imported: number; errors: string[] }> {
    const rows = parseStockExcel(fileBuffer);
    const errors: string[] = [];
    let imported = 0;

    for (const row of rows) {
      try {
        // 1. Find the item by name (case‑sensitive)
        const item = await this.prisma.item.findFirst({
          where: {
            name: { equals: row.productName },
          },
          include: { unit: true },
        });

        if (!item) {
          errors.push(`Item "${row.productName}" not found.`);
          continue;
        }

        // 2. Build the DTO – include all required fields
        const dto = {
          itemId: item.id,
          storeId,
          toStoreId: '', // dummy – not used for Restock
          unitId: item.unitId,
          qty: row.quantity.toString(),
          category: InventoryRecordCategory.Restock,
          employeeId,
          deliveryNoteId: '', // or '' if DTO requires string
          source: 'Excel Import',
          description: `Bulk restock from Excel (${row.quantity} units)`,
        };

        // 3. Call the existing create method (in StockMovementService)
        await this.stockMvtService.create([], dto);
        imported++;
      } catch (error: any) {
        errors.push(`Error processing "${row.productName}": ${error.message}`);
      }
    }

    return {
      total: rows.length,
      imported,
      errors,
    };
  }
}