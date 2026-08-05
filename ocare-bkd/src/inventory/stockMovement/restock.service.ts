import { Injectable, BadRequestException } from '@nestjs/common';
import { ReceivePurchaseDto } from 'src/dto/stockMovement.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PurchaseService {
  constructor(private readonly prisma: PrismaService) {}

  async receivePurchase(dto: ReceivePurchaseDto) {
    return this.prisma.$transaction(async (tx) => {
      /**
       * STEP 1
       * Validate header
       */

      const supplier = await tx.supplier.findUnique({
        where: {
          id: dto.supplierId,
        },
      });

      if (!supplier) throw new BadRequestException('Supplier not found.');

      const store = await tx.store.findUnique({
        where: {
          id: dto.storeId,
        },
      });

      if (!store) throw new BadRequestException('Store not found.');

      const employee = await tx.employee.findUnique({
        where: {
          id: dto.receivedBy,
        },
      });

      if (!employee) throw new BadRequestException('Employee not found.');

      /**
       * Prevent duplicate invoice numbers per supplier
       */

      const existingInvoice = await tx.purchase.findFirst({
        where: {
          supplierId: dto.supplierId,
          invoiceNumber: dto.invoiceNumber,
        },
      });

      if (existingInvoice)
        throw new BadRequestException('Invoice already exists.');

      /**
       * STEP 2
       * Create Purchase Header
       */

      const purchase = await tx.purchase.create({
        data: {
          supplierId: dto.supplierId,
          storeId: dto.storeId,
          receivedBy: dto.receivedBy,
          invoiceNumber: dto.invoiceNumber,
          invoiceDate: dto.invoiceDate,
          notes: dto.notes,
        },
      });

      /**
       * STEP 3
       * Loop through every item
       */

      for (const line of dto.items) {
        /**
         * Validate item
         */

        const item = await tx.item.findUnique({
          where: {
            id: line.itemId,
          },
        });

        if (!item)
          throw new BadRequestException(`Item ${line.itemId} not found.`);

        /**
         * Validate unit
         */

        const unit = await tx.unit.findUnique({
          where: {
            id: line.unitId,
          },
        });

        if (!unit) throw new BadRequestException('Invalid unit.');

        /**
         * Validate brand
         */

        const brand = await tx.brand.findUnique({
          where: {
            id: line.batch.brandId,
          },
        });

        if (!brand) throw new BadRequestException('Brand not found.');

        /**
         * STEP 4
         * Find existing batch
         */

        let batch = await tx.batch.findFirst({
          where: {
            itemId: line.itemId,
            number: line.batch.number,
          },
        });

        /**
         * STEP 5
         * Create batch if missing
         */

        if (!batch) {
          batch = await tx.batch.create({
            data: {
              itemId: line.itemId,

              number: line.batch.number,

              expiryDate: line.batch.expiryDate,

              brandId: line.batch.brandId,

              buyingPrice: line.batch.buyingPrice,

              sellingPrice: line.batch.sellingPrice,

              wholesalePrice: line.batch.wholesalePrice ?? 0,
            },
          });
        }

        /**
         * STEP 6
         * Create Purchase Item
         */

        await tx.purchaseItem.create({
          data: {
            purchaseId: purchase.id,

            itemId: line.itemId,

            batchId: batch.id,

            unitId: line.unitId,

            quantity: line.quantity,

            buyingPrice: line.batch.buyingPrice,

            sellingPrice: line.batch.sellingPrice,

            wholesalePrice: line.batch.wholesalePrice ?? 0,
          },
        });

        /**
         * STEP 7
         * Update Batch Inventory
         */

        const inventory = await tx.batchInventory.findFirst({
          where: {
            batchId: batch.id,
            storeId: dto.storeId,
          },
        });

        if (!inventory) {
          await tx.batchInventory.create({
            data: {
              batchId: batch.id,
              storeId: dto.storeId,
              quantity: line.quantity,
            },
          });
        } else {
          await tx.batchInventory.update({
            where: {
              id: inventory.id,
            },
            data: {
              quantity: {
                increment: line.quantity,
              },
            },
          });
        }

        /**
         * STEP 7.5
         * Update Product Inventory Summary
         */

        const productInventory = await tx.productInventory.findUnique({
          where: {
            itemId_storeId_unitId: {
              itemId: line.itemId,
              storeId: dto.storeId,
              unitId: line.unitId,
            },
          },
        });

        if (!productInventory) {
          await tx.productInventory.create({
            data: {
              itemId: line.itemId,
              storeId: dto.storeId,
              unitId: line.unitId,
              qty: line.quantity,
            },
          });
        } else {
          await tx.productInventory.update({
            where: {
              id: productInventory.id,
            },
            data: {
              qty: {
                increment: line.quantity,
              },
            },
          });
        }
        /**
         * STEP 8
         * Inventory Audit Trail
         */

        await tx.inventoryRecord.create({
          data: {
            category: 'Restock',

            itemId: line.itemId,

            batchId: batch.id,

            storeId: dto.storeId,

            unitId: line.unitId,

            qty: line.quantity,

            initiatedQty: inventory?.quantity ?? 0,

            remainingQuantity: (inventory?.quantity ?? 0) + line.quantity,

            source:
              supplier.businessName ||
              `${supplier.firstName} ${supplier.lastName}`,

            description: dto.notes || '',

            recordedBy: dto.receivedBy,
          },
        });
      }

      /**
       * STEP 9
       * Return purchase
       */

      return purchase;
    });
  }
}
