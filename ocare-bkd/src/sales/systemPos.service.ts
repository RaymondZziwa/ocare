import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateSystemSaleDto } from 'src/dto/systemSale.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { collectPayment } from 'src/utils/payments/collectPayment';
import { randomUUID } from 'crypto';

export interface CollectionResponse {
  status: string;
  message: string;

  data: {
    transaction: {
      uuid: string;
      reference: string;
      status: string;
      provider_reference: string;
    };

    collection: {
      amount: {
        total?: number;
        currency?: string;
      };

      provider: string;
      phone_number: string;
      mode: string;
    };

    timeline: {
      initiated_at: string;
      estimated_settlement: string;
    };

    metadata: {
      response_timestamp: string;
      sandbox_mode: boolean;
    };
  };
}
@Injectable()
export class SystemPosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  private async initiateMobileMoneyCollection(
    total: number,
    phoneNumber: string,
  ) {
    const paymentResult: CollectionResponse = await collectPayment(
      this.httpService,
      this.configService,
      {
        amount: total,
        phone_number: phoneNumber,
        country: 'UG',
        description: 'POS Sale Payment',
      },
    );

    return paymentResult;
  }

  async saveSale(dto: CreateSystemSaleDto) {
    if (dto.paymentMethod !== 'cash') {
      throw new BadRequestException('Only cash sales are currently supported.');
    }

    /**
     * ----------------------------------------
     * HEADER VALIDATION
     * ----------------------------------------
     */

    const [store, employee, customer] = await Promise.all([
      this.prisma.store.findUnique({
        where: { id: dto.storeId },
      }),

      this.prisma.employee.findUnique({
        where: { id: dto.soldBy },
      }),

      dto.customerId
        ? this.prisma.client.findUnique({
            where: { id: dto.customerId },
          })
        : Promise.resolve(null),
    ]);

    if (!store) throw new BadRequestException('Store not found.');

    if (!employee) throw new BadRequestException('Employee not found.');

    if (dto.customerId && !customer)
      throw new BadRequestException('Customer not found.');

    /**
     * ----------------------------------------
     * LOAD EVERYTHING ONCE
     * ----------------------------------------
     */

    const batchIds = dto.items.map((x) => x.batchId);

    const itemIds = dto.items.map((x) => x.itemId);

    const unitIds = dto.items.map((x) => x.unitId);

    const [batches, batchInventories, productInventories] = await Promise.all([
      this.prisma.batch.findMany({
        where: {
          id: {
            in: batchIds,
          },
        },
      }),

      this.prisma.batchInventory.findMany({
        where: {
          batchId: {
            in: batchIds,
          },
          storeId: dto.storeId,
        },
      }),

      this.prisma.productInventory.findMany({
        where: {
          storeId: dto.storeId,
          itemId: {
            in: itemIds,
          },
          unitId: {
            in: unitIds,
          },
        },
      }),
    ]);

    /**
     * ----------------------------------------
     * BUILD LOOKUPS
     * ----------------------------------------
     */

    const batchMap = new Map(batches.map((b) => [b.id, b]));

    const batchInventoryMap = new Map(
      batchInventories.map((b) => [b.batchId, b]),
    );

    const productInventoryMap = new Map(
      productInventories.map((p) => [`${p.itemId}_${p.unitId}`, p]),
    );

    /**
     * ----------------------------------------
     * VALIDATE + CALCULATE
     * ----------------------------------------
     */

    let subtotal = 0;

    const processedItems: any[] = [];

    for (const item of dto.items) {
      const batch = batchMap.get(item.batchId);

      if (!batch)
        throw new BadRequestException(`Batch ${item.batchId} not found.`);

      if (batch.itemId !== item.itemId)
        throw new BadRequestException(
          'Batch does not belong to selected item.',
        );

      const batchInventory = batchInventoryMap.get(item.batchId);

      if (!batchInventory)
        throw new BadRequestException(`Batch ${batch.number} is not stocked.`);

      if (batchInventory.quantity < item.quantity)
        throw new BadRequestException(
          `${batch.number} has only ${batchInventory.quantity} remaining.`,
        );

      const productInventory = productInventoryMap.get(
        `${item.itemId}_${item.unitId}`,
      );

      if (!productInventory)
        throw new BadRequestException('Product inventory missing.');

      if (productInventory.qty < item.quantity)
        throw new BadRequestException('Overall inventory is insufficient.');

      const unitPrice =
        item.saleType === 'wholesale'
          ? Number(batch.wholesalePrice)
          : Number(batch.sellingPrice);

      const lineTotal = unitPrice * item.quantity;

      subtotal += lineTotal;

      processedItems.push({
        ...item,
        batch,
        batchInventory,
        productInventory,
        unitPrice,
        lineTotal,
      });
    }

    /**
     * ----------------------------------------
     * SAVE EVERYTHING
     * ----------------------------------------
     */
    const saleNumber = `SAL-${new Date().getFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`;

    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.salePayment.create({
        data: {
          cashierId: dto.soldBy,
          amount: subtotal,
        },
      });

      const sale = await tx.shopSale.create({
        data: {
          saleNumber,

          customerId: dto.customerId,

          storeId: dto.storeId,

          servedBy: dto.soldBy,

          paymentMethod: dto.paymentMethod,

          subtotal,

          total: subtotal,

          status: 'SUCCESSFUL',

          salePaymentId: payment.id,
        },
      });

      for (const item of processedItems) {
        await tx.saleItem.create({
          data: {
            saleId: sale.id,

            itemId: item.itemId,

            batchId: item.batchId,

            unitId: item.unitId,

            quantity: item.quantity,
            saleType: 'In_shop',

            mode: item.saleType === 'wholesale' ? 'Wholesale' : 'Retail',

            unitPrice: item.unitPrice,

            total: item.lineTotal,
          },
        });

        await tx.batchInventory.update({
          where: {
            id: item.batchInventory.id,
          },
          data: {
            quantity: {
              decrement: item.quantity,
            },
          },
        });

        await tx.productInventory.update({
          where: {
            id: item.productInventory.id,
          },
          data: {
            qty: {
              decrement: item.quantity,
            },
          },
        });
      }

      return {
        status: 200,
        message: 'Sale completed successfully.',
        data: sale,
      };
    });
  }
}
