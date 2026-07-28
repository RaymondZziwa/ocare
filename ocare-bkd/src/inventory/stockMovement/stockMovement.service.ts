// stock-movement.service.ts
import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InventoryRecordCategory, StockTransferStatus } from '@prisma/client';
import {
  ConfirmStockMovementDto,
  CreateStockMovementDto,
  RejectStockMovementDto,
} from 'src/dto/stockMovement.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { StockTransferIdGeneratorService } from 'src/utils/stockTransferIdGenerator';

@Injectable()
export class StockMovementService {
  constructor(
    private prisma: PrismaService,
    private readonly stockTransferIdGeneratorService: StockTransferIdGeneratorService,
  ) {}

  async create(files: Express.Multer.File[], dto: CreateStockMovementDto) {
    const {
      itemId,
      storeId,
      toStoreId,
      unitId,
      qty: oldQty,
      category,
      employeeId,
      // deliveryNoteId,
      description,
      source,
    } = dto;
    const qty = parseFloat(oldQty);

    const imagePaths = files.map(
      (file) => `/uploads/evidence/${file.filename}`,
    );

    // 1. Validate store and authorization
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    });
    if (!store) throw new NotFoundException('Store not found');

    const authorized = (store.authorizedPersonnel as any[]) || [];
    if (!authorized.includes(employeeId)) {
      throw new ForbiddenException(
        'You are not authorized to perform operations in this store',
      );
    }

    // 2. Handle inventory logic and calculate remaining quantity
    let productInventory = await this.prisma.productInventory.findFirst({
      where: {
        itemId: itemId,
        storeId: storeId,
        unitId: unitId,
      },
    });

    let remainingQuantity = 0;

    switch (category) {
      case InventoryRecordCategory.Restock:
        if (!productInventory) {
          productInventory = await this.prisma.productInventory.create({
            data: {
              itemId: itemId,
              storeId: storeId,
              unitId: unitId,
              qty,
            },
          });
          remainingQuantity = qty;
        } else {
          const newQty = productInventory.qty + qty;
          productInventory = await this.prisma.productInventory.update({
            where: { id: productInventory.id },
            data: { qty: newQty },
          });
          remainingQuantity = newQty;
        }
        break;

      case InventoryRecordCategory.Depletion: {
        if (!productInventory)
          throw new NotFoundException('Item not found in store');
        if (productInventory.qty < qty)
          throw new ForbiddenException('Insufficient stock');

        const newQtyDepletion = productInventory.qty - qty;
        productInventory = await this.prisma.productInventory.update({
          where: { id: productInventory.id },
          data: { qty: newQtyDepletion },
        });
        remainingQuantity = newQtyDepletion;
        break;
      }

      case InventoryRecordCategory.Adjustment:
        if (!productInventory) {
          productInventory = await this.prisma.productInventory.create({
            data: {
              itemId: itemId,
              storeId: storeId,
              unitId: unitId,
              qty,
            },
          });
          remainingQuantity = qty;
        } else {
          productInventory = await this.prisma.productInventory.update({
            where: { id: productInventory.id },
            data: { qty },
          });
          remainingQuantity = qty;
        }
        break;

      case InventoryRecordCategory.Transfer: {
        if (!productInventory)
          throw new NotFoundException('Item not found in store');
        if (productInventory.qty < qty)
          throw new ForbiddenException('Insufficient stock for transfer');

        // Deduct from source and calculate remaining quantity
        const newQtyTransfer = productInventory.qty - qty;
        await this.prisma.productInventory.update({
          where: { id: productInventory.id },
          data: { qty: newQtyTransfer },
        });

        // Log transfer
        const transferId = await this.stockTransferIdGeneratorService.generateUniqueTransferId();

        await this.prisma.inventoryRecord.create({
          data: {
            itemId: itemId,
            storeId: storeId,
            toStoreId: toStoreId,
            unitId: unitId,
            category,
            initiatedQty: qty,
            qty,
            remainingQuantity: newQtyTransfer,
            images: imagePaths,
            source,
            description,
            recordedBy: employeeId,
            transferId,
            transferStatus: StockTransferStatus.Pending,
          },
        });

        return {
          status: 200,
          message: 'Stock transfer initiated successfully',
        };
      }
    }

    // 3. Log movement for non-transfer types with remaining quantity
    await this.prisma.inventoryRecord.create({
      data: {
        itemId: itemId,
        storeId: storeId,
        unitId: unitId,
        category,
        qty,
        remainingQuantity, // Store remaining quantity
        images: imagePaths,
        source,
        description,
        recordedBy: employeeId,
      },
    });

    return {
      status: 200,
      message: 'Stock movement recorded successfully',
      data: productInventory,
    };
  }

  async confirmStockTransfer(dto: ConfirmStockMovementDto) {
    const { transferId, confirmedQty, notes } = dto;

    console.log(transferId, confirmedQty, notes);
    try {
      const transferRecord = await this.prisma.inventoryRecord.findFirst({
        where: { id: transferId },
      });

      if (!transferRecord)
        throw new NotFoundException('Transfer record not found');

      // Find destination store inventory
      let destinationInventory = await this.prisma.productInventory.findFirst({
        where: {
          itemId: transferRecord.itemId,
          ...(transferRecord.toStoreId
            ? { storeId: transferRecord.toStoreId }
            : {}),
          ...(transferRecord.unitId ? { unitId: transferRecord.unitId } : {}),
        },
      });

      if (!destinationInventory) {
        destinationInventory = await this.prisma.productInventory.create({
          data: {
            itemId: transferRecord.itemId,
            storeId: transferRecord.toStoreId!,
            unitId: transferRecord.unitId,
            qty: transferRecord.qty,
          },
        });
      } else {
        await this.prisma.productInventory.update({
          where: { id: destinationInventory.id },
          data: { qty: destinationInventory.qty + confirmedQty },
        });
      }

      // Update record to Confirmed
      await this.prisma.inventoryRecord.updateMany({
        where: { id: transferId },
        data: {
          qty: confirmedQty,
          transferStatus: StockTransferStatus.Confirmed,
          extraNote: notes,
        },
      });

      return {
        status: 200,
        message: 'Stock transfer Confirmed successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Error confirming stock transfer: ' + error,
      );
    }
  }

  async rejectStockTransfer(dto: RejectStockMovementDto) {
    const { transferId, reason } = dto;
    try {
      const transferRecord = await this.prisma.inventoryRecord.findFirst({
        where: { id: transferId },
      });

      if (!transferRecord)
        throw new NotFoundException('Transfer record not found');

      if (
        transferRecord.transferStatus !== StockTransferStatus.Pending &&
        transferRecord.transferStatus
      ) {
        throw new ForbiddenException(
          `Cannot reject a transfer that is already ${transferRecord?.transferStatus.toLowerCase()}`,
        );
      }

      // Restore deducted quantity to source store inventory
      const sourceInventory = await this.prisma.productInventory.findFirst({
        where: {
          itemId: transferRecord.itemId,
          storeId: transferRecord.storeId,
          unitId: transferRecord.unitId,
        },
      });

      if (sourceInventory) {
        await this.prisma.productInventory.update({
          where: { id: sourceInventory.id },
          data: { qty: sourceInventory.qty + transferRecord.qty },
        });
      } else {
        // In rare case the source inventory was removed
        await this.prisma.productInventory.create({
          data: {
            itemId: transferRecord.itemId,
            storeId: transferRecord.storeId,
            unitId: transferRecord.unitId,
            qty: transferRecord.qty,
          },
        });
      }

      // Update the transfer record
      await this.prisma.inventoryRecord.updateMany({
        where: { id: transferId },
        data: {
          transferStatus: StockTransferStatus.Rejected,
          extraNote: reason,
        },
      });

      return {
        status: 200,
        message:
          'Stock transfer Rejected successfully and source stock restored',
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Error rejecting stock transfer: ' + error,
      );
    }
  }

  async resolveStockMvtConflict(recordId: string, notes: string) {
    try {
      const record = await this.prisma.inventoryRecord.findUnique({
        where: {
          id: recordId,
        },
      });

      if (!record) throw new NotFoundException('Transfer record not found');
      console.log(notes);

      await this.prisma.inventoryRecord.update({
        where: {
          id: record.id,
        },
        data: {
          isResolved: true,
          resolveNotes: notes,
        },
      });

      return {
        status: 200,
        message: 'Stock transfer has been resolved successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Error resolving transfer stock mismatch: ' + error,
      );
    }
  }

  async getAllStockMovementRecords() {
    try {
      const records = await this.prisma.inventoryRecord.findMany({
        include: {
          item: true,
          store: true,
          toStore: true,
          unit: true,
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return {
        status: 200,
        message: 'Stock movement records fetched successfully',
        data: records,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
