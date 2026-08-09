import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AdjustStockDto } from 'src/dto/stockMovement.dto';

@Injectable()
export class StockAdjustmentService {
  constructor(private readonly prisma: PrismaService) {}

  async adjustStock(dto: AdjustStockDto) {
    return this.prisma.$transaction(async (tx) => {
      /**
       * =========================================================
       * STEP 1: Validate Store
       * =========================================================
       */

      const store = await tx.store.findUnique({
        where: {
          id: dto.storeId,
        },
      });

      if (!store) {
        throw new NotFoundException('Store not found.');
      }

      /**
       * =========================================================
       * STEP 2: Validate Employee
       * =========================================================
       */

      const employee = await tx.employee.findUnique({
        where: {
          id: dto.adjustedBy,
        },
      });

      if (!employee) {
        throw new NotFoundException('Employee not found.');
      }

      /**
       * Prevent empty adjustment
       */

      if (!dto.items || dto.items.length === 0) {
        throw new BadRequestException(
          'At least one item is required for stock adjustment.',
        );
      }

      const results: {
        itemId: string;
        itemName: string;

        unitId: string;
        unitName: string;

        batchId: string;
        batchNumber: string;

        batchInventoryId: string;

        previousQuantity: number;
        newQuantity: number;
        difference: number;

        productInventoryQuantity: number;
        message: string;
      }[] = [];

      /**
       * =========================================================
       * STEP 3: Process Each Adjustment
       * =========================================================
       */

      for (const adjustment of dto.items) {
        /**
         * Validate quantity
         *
         * quantity represents the NEW quantity.
         */
        if (
          adjustment.quantity === undefined ||
          adjustment.quantity === null ||
          adjustment.quantity < 0
        ) {
          throw new BadRequestException(
            `Invalid quantity for item ${adjustment.itemId}.`,
          );
        }

        /**
         * =======================================================
         * STEP 4: Find Item
         * =======================================================
         *
         * Unit comes from the Item.
         */

        const item = await tx.item.findUnique({
          where: {
            id: adjustment.itemId,
          },
          include: {
            unit: true,
          },
        });

        if (!item) {
          throw new NotFoundException(`Item ${adjustment.itemId} not found.`);
        }

        /**
         * The unit is determined by the item.
         */
        const unitId = item.unitId;

        if (!unitId) {
          throw new BadRequestException(
            `Item "${item.name}" does not have a unit configured.`,
          );
        }

        /**
         * =======================================================
         * STEP 5: Find Batch
         * =======================================================
         *
         * Batch numbers are unique per item:
         *
         * @@unique([itemId, number])
         *
         * Therefore we MUST search using both itemId and
         * batch number.
         */

        const batch = await tx.batch.findFirst({
          where: {
            itemId: adjustment.itemId,
            number: adjustment.batch.number,
          },
        });

        if (!batch) {
          throw new NotFoundException(
            `Batch "${adjustment.batch.number}" was not found for item "${item.name}".`,
          );
        }

        /**
         * =======================================================
         * STEP 6: Find Batch Inventory
         * =======================================================
         *
         * Batch quantity is specific to a store.
         */

        const batchInventory = await tx.batchInventory.findUnique({
          where: {
            batchId_storeId: {
              batchId: batch.id,
              storeId: dto.storeId,
            },
          },
        });

        if (!batchInventory) {
          throw new NotFoundException(
            `Batch "${batch.number}" has no inventory record in "${store.name}".`,
          );
        }

        /**
         * =======================================================
         * STEP 7: Calculate Adjustment
         * =======================================================
         */

        const previousQuantity = batchInventory.quantity;

        const newQuantity = adjustment.quantity;

        const difference = newQuantity - previousQuantity;

        /**
         * Nothing actually changed.
         */
        if (difference === 0) {
          results.push({
            itemId: item.id,
            itemName: item.name,
            batchId: batch.id,
            batchNumber: batch.number,
            previousQuantity,
            newQuantity,
            difference: 0,
            message: 'No quantity change required.',
            unitId: '',
            unitName: '',
            batchInventoryId: '',
            productInventoryQuantity: 0,
          });

          continue;
        }

        /**
         * =======================================================
         * STEP 8: Update Batch Inventory
         * =======================================================
         */

        await tx.batchInventory.update({
          where: {
            id: batchInventory.id,
          },
          data: {
            quantity: newQuantity,
          },
        });

        /**
         * =======================================================
         * STEP 9: Recalculate Product Inventory
         * =======================================================
         *
         * ProductInventory represents the total quantity of
         * this item in this store across all batches.
         */

        const allBatchInventories = await tx.batchInventory.findMany({
          where: {
            storeId: dto.storeId,
            batch: {
              itemId: item.id,
            },
          },
        });

        const totalQuantity = allBatchInventories.reduce((total, inventory) => {
          return total + inventory.quantity;
        }, 0);

        /**
         * =======================================================
         * STEP 10: Update ProductInventory
         * =======================================================
         */

        const productInventory = await tx.productInventory.findUnique({
          where: {
            itemId_storeId_unitId: {
              itemId: item.id,
              storeId: dto.storeId,
              unitId,
            },
          },
        });

        if (productInventory) {
          await tx.productInventory.update({
            where: {
              id: productInventory.id,
            },
            data: {
              qty: totalQuantity,
            },
          });
        } else {
          await tx.productInventory.create({
            data: {
              itemId: item.id,
              storeId: dto.storeId,
              unitId,
              qty: totalQuantity,
            },
          });
        }

        /**
         * =======================================================
         * STEP 11: Create Inventory Audit Record
         * =======================================================
         *
         * qty = actual change
         *
         * Example:
         *
         * Previous = 20
         * New      = 15
         * qty      = -5
         *
         * OR
         *
         * Previous = 20
         * New      = 25
         * qty      = +5
         */

        await tx.inventoryRecord.create({
          data: {
            category: 'Adjustment',

            itemId: item.id,

            batchId: batch.id,

            storeId: dto.storeId,

            unitId,

            initiatedQty: previousQuantity,

            qty: difference,

            remainingQuantity: newQuantity,

            source: 'Stock Adjustment',

            description:
              dto.notes ||
              `Stock adjusted from ${previousQuantity} to ${newQuantity}.`,

            recordedBy: dto.adjustedBy,
          },
        });

        /**
         * =======================================================
         * STEP 12: Add Result
         * =======================================================
         */

        results.push({
          itemId: item.id,
          itemName: item.name,

          unitId,
          unitName: item.unit?.name,

          batchId: batch.id,
          batchNumber: batch.number,

          batchInventoryId: batchInventory.id,

          previousQuantity,
          newQuantity,
          difference,

          productInventoryQuantity: totalQuantity,
          message: '',
        });
      }

      /**
       * =========================================================
       * STEP 13: Return
       * =========================================================
       */

      return {
        status: 200,
        message: 'Stock adjustment completed successfully.',
        data: results,
      };
    });
  }
}
