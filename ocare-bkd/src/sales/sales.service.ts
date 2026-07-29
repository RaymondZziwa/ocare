import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateSaleDto } from 'src/dto/pos.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { collectPayment } from 'src/utils/payments/collectPayment';

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
export class SalesService {
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

  async create(createSaleDto: CreateSaleDto) {
    const {
      customerId,
      servedBy,
      source,
      storeId,
      items,
      paymentMethod,
      notes,
      total,
      totalWithDelivery,
      phoneNumber,
    } = createSaleDto;

    let isMobileMoneyPayment = false;
    let storeToUseId = storeId;
    if (
      paymentMethod === 'airtel' ||
      paymentMethod === 'mtn' ||
      paymentMethod === 'visa'
    ) {
      isMobileMoneyPayment = true;
    }

    if (source !== 'In_shop') {
      const store = await this.prisma.store.findFirst({
        where: {
          isForAppSales: true,
        },
      });

      if (!store)
        throw new NotFoundException(
          'There is no store set to handle Web and App sales',
        );
      storeToUseId = store.id;
    }

    if (isMobileMoneyPayment) {
      const inventories = await this.prisma.productInventory.findMany({
        where: {
          storeId: storeToUseId,
          OR: items.map((item) => ({
            itemId: item.id,
            unitId: item.unitId,
          })),
        },
      });

      // Build lookup map: "itemId-unitId" → inventory
      const inventoryMap = new Map(
        inventories.map((inv) => [`${inv.itemId}-${inv.unitId}`, inv]),
      );

      // 2️⃣ Check stock availability
      for (const saleItem of items) {
        console.log(saleItem);
        const key = `${saleItem.id}-${saleItem.unitId}`;
        const inventory = inventoryMap.get(key);

        if (!inventory || inventory.qty < saleItem.quantity) {
          console.log(inventory?.qty, saleItem.quantity);
          throw new BadRequestException(
            `Insufficient stock for item "${saleItem.name}". Available: ${inventory?.qty ?? 0}, Required: ${saleItem.quantity}`,
          );
        }
      }

      const response = await this.initiateMobileMoneyCollection(
        source === 'In_shop' ? total : totalWithDelivery,
        `+${phoneNumber}`,
      );

      // 4️⃣ Create sale record and payment records inside a transaction
      const sale = await this.prisma.$transaction(async (tx) => {
        const salePayment = await tx.salePayment.create({
          data: {
            phone_number: phoneNumber,
            amount: createSaleDto.totalWithDelivery,
            notes,
            cashierId: servedBy,
            transaction_uuid: response.data.transaction.uuid,
            transaction_reference: response.data.transaction.reference,
            provider_transaction_id:
              response.data.transaction.provider_reference,
            amount_formatted: String(createSaleDto.totalWithDelivery),
            provider: response.data.collection.provider,
            provider_mode: response.data.collection.mode,
          },
        });

        const createdSale = await tx.sale.create({
          data: {
            clientId: String(customerId),
            servedBy,
            type: source,
            storeId: storeToUseId,
            status: 'UNPAID',
            saleStatus: 'PENDING',
            total,
            paymentMethod,
            salePaymentId: salePayment.id,
            notes,
            items,
          },
          include: {
            client: true,
            store: true,
            employee: true,
          },
        });
        await tx.saleTimeLine.create({
          data: {
            saleId: createdSale.id,
            state: 'CONFIRMED',
          },
        });

        return createdSale;
      });

      return {
        message:
          'Mobile money collection initiated. Sale will be completed upon successful payment.',
        data: { sale, transaction: response.data.transaction },
        status: 200,
      };
    } else {
      return this.prisma.$transaction(async (tx) => {
        // 1️⃣ Fetch inventory matching itemId + unitId in this store
        const inventories = await tx.productInventory.findMany({
          where: {
            storeId,
            OR: items.map((item) => ({
              itemId: item.id,
              unitId: item.unitId,
            })),
          },
        });

        // Build lookup map: "itemId-unitId" → inventory
        const inventoryMap = new Map(
          inventories.map((inv) => [`${inv.itemId}-${inv.unitId}`, inv]),
        );

        // 2️⃣ Check stock availability
        for (const saleItem of items) {
          const key = `${saleItem.id}-${saleItem.unitId}`;
          const inventory = inventoryMap.get(key);

          if (!inventory || inventory.qty < saleItem.quantity) {
            throw new BadRequestException(
              `Insufficient stock for item "${saleItem.name}". Available: ${inventory?.qty ?? 0}, Required: ${saleItem.quantity}`,
            );
          }
        }

        // 3️⃣ Reduce inventory quantities
        for (const saleItem of items) {
          const key = `${saleItem.id}-${saleItem.unitId}`;
          const inventory = inventoryMap.get(key);

          if (!inventory) {
            throw new BadRequestException(
              `Inventory record not found for item "${saleItem.name}"`,
            );
          }

          await tx.productInventory.update({
            where: { id: inventory.id },
            data: {
              qty: inventory.qty - saleItem.quantity,
            },
          });
        }

        const salePayment = await tx.salePayment.create({
          data: {
            amount: createSaleDto.totalWithDelivery,
            notes,
            cashierId: servedBy,
          },
        });

        // 4️⃣ Create sale record
        const sale = await tx.sale.create({
          data: {
            clientId: String(customerId),
            servedBy,
            type: source,
            storeId: storeToUseId,
            status: 'FULLY_PAID',
            saleStatus: 'SUCCESSFUL',
            total,
            paymentMethod,
            salePaymentId: salePayment.id,
            notes,
            items,
          },
          include: {
            client: true,
            store: true,
            employee: true,
          },
        });

        await tx.saleTimeLine.create({
          data: {
            saleId: sale.id,
            state: 'CONFIRMED',
          },
        });
        return {
          message: 'Sale created successfully',
          data: sale,
          status: 200,
        };
      });
    }
  }

  async findAll() {
    return this.prisma.sale.findMany({
      include: {
        client: true,
        store: true,
        employee: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const sale = await this.prisma.sale.findUnique({
      where: { id: id },
      include: {
        client: true,
        store: true,
        employee: true,
      },
    });

    if (!sale) {
      throw new NotFoundException(`Sale with ID ${id} not found`);
    }

    return sale;
  }

  async remove(id: string) {
    const existing = await this.prisma.sale.findUnique({
      where: { id: id },
    });
    if (!existing) throw new NotFoundException(`Sale with ID ${id} not found`);

    await this.prisma.sale.delete({ where: { id: id } });

    return { message: 'Sale deleted successfully' };
  }

  async getAllUserPurchases(id: string) {
    const sales = await this.prisma.sale.findMany({
      where: {
        clientId: id,
      },
      include: {
        timeLine: true,
      },
    });

    return {
      data: sales,
      message: 'User purchases retrieved successfully',
    };
  }
}
