import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentStatus } from '@prisma/client';
import {
  CollectCreditPaymentDto,
  CreateSaleDto,
  UpdateSaleDto,
} from 'src/dto/pos.dto';
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
      storeId,
      items,
      paymentMethods,
      notes,
      total,
      totalWithCharges,
      balance,
      status,
      phoneNumber,
    } = createSaleDto;

    const mobileMoneyMethods = paymentMethods?.filter(
      (method) => method.type === 'MTN_MOMO' || method.type === 'AIRTEL_MOMO',
    );
    const hasCashOrProfMomo = paymentMethods?.some(
      (method) => method.type === 'CASH' || method.type === 'PROF_MOMO',
    );
    const finalSaleStatus = status;
    const isMobileMoneyPayment =
      mobileMoneyMethods &&
      mobileMoneyMethods.length > 0 &&
      totalWithCharges &&
      totalWithCharges > total;

    if (isMobileMoneyPayment) {
      const inventories = await this.prisma.productInventory.findMany({
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
      const response = await this.initiateMobileMoneyCollection(
        totalWithCharges,
        phoneNumber,
      );

      // 4️⃣ Create sale record and payment records inside a transaction
      const sale = await this.prisma.$transaction(async (tx) => {
        const createdSale = await tx.sale.create({
          data: {
            clientId: String(customerId),
            servedBy,
            storeId,
            type: 'WEB',
            status: finalSaleStatus,
            saleStatus: 'PENDING',
            total,
            balance,
            paymentMethods: JSON.parse(JSON.stringify(paymentMethods)),
            notes,
            items: JSON.parse(JSON.stringify(items)),
          },
          include: {
            client: true,
            store: true,
            employee: true,
          },
        });

        const salePayments = await Promise.all(
          paymentMethods.map((method) =>
            tx.salePayments.create({
              data: {
                saleId: createdSale.id,
                amount: method.amount,
                paymentMethod: method.type,
                referenceId: mobileMoneyMethods.some(
                  (mobileMethod) => mobileMethod.type === method.type,
                )
                  ? response.data.transaction.reference
                  : '',
                notes,
                cashierId: servedBy,
              },
            }),
          ),
        );

        const mobilePayments = salePayments.filter((payment) =>
          ['MTN_MOMO', 'AIRTEL_MOMO'].includes(payment.paymentMethod),
        );

        if (mobilePayments.length > 0) {
          await Promise.all(
            mobilePayments.map((payment) =>
              tx.salePaymentTransactionHistory.create({
                data: {
                  salePaymentId: payment.id,
                  transaction_uuid: response.data.transaction.uuid,
                  transaction_reference: response.data.transaction.reference,
                  provider_transaction_id:
                    response.data.transaction.provider_reference,
                  amount: payment.amount,
                  amount_formatted: String(payment.amount),
                  currency: 'UGX',
                  payment_method: payment.paymentMethod,
                  provider: response.data.collection.provider,
                  provider_mode: response.data.collection.mode,
                  phone_number: response.data.collection.phone_number,
                  status: 'PENDING',
                  description: 'Mobile money collection initiated',
                  notes: 'Mobile money collection initiated',
                  cashierId: servedBy,
                  transaction_initiated_at: response.data.timeline?.initiated_at
                    ? new Date(response.data.timeline.initiated_at)
                    : null,
                },
              }),
            ),
          );
        }

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

        // 4️⃣ Create sale record
        const sale = await tx.sale.create({
          data: {
            clientId: String(customerId),
            servedBy,
            storeId,
            status: finalSaleStatus,
            saleStatus: 'SUCCESSFUL',
            total,
            balance,
            paymentMethods: JSON.parse(JSON.stringify(paymentMethods)),
            notes,
            items: JSON.parse(JSON.stringify(items)),
          },
          include: {
            client: true,
            store: true,
            employee: true,
          },
        });

        // 5️⃣ Create payment records
        if (paymentMethods && paymentMethods.length > 0) {
          await Promise.all(
            paymentMethods.map((method) =>
              tx.salePayments.create({
                data: {
                  saleId: sale.id,
                  amount: method.amount,
                  paymentMethod: method.type,
                  referenceId: '',
                  notes,
                  cashierId: servedBy,
                },
              }),
            ),
          );
        }

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

  async findCreditSales(id: string) {
    const sales = await this.prisma.sale.findMany({
      where: {
        balance: {
          gt: 0,
        },
        storeId: id,
        status: {
          in: ['PARTIALLY_PAID', 'UNPAID'],
        },
      },
      include: {
        client: true,
        store: true,
        employee: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      message: 'Credit sales retrieved successfully',
      data: sales,
      status: 200,
    };
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

  async update(id: string, updateSaleDto: UpdateSaleDto) {
    // 1️⃣ Check if sale exists
    const existingSale = await this.prisma.sale.findUnique({
      where: { id: id },
    });

    if (!existingSale) {
      throw new NotFoundException(`Sale with ID ${id} not found`);
    }

    // 2️⃣ Optional: Validate SaleStatus if provided
    if (
      updateSaleDto.status &&
      !Object.values(PaymentStatus).includes(updateSaleDto.status)
    ) {
      throw new Error(`Invalid sale status: ${updateSaleDto.status}`);
    }

    // 3️⃣ Update the sale
    const updatedSale = await this.prisma.sale.update({
      where: { id: id },
      data: updateSaleDto,
      include: {
        client: true,
        store: true,
        employee: true,
      },
    });

    // 4️⃣ Return formatted response
    return {
      message: 'Sale updated successfully',
      data: updatedSale,
    };
  }

  async collectCreditPayment(dto: CollectCreditPaymentDto) {
    const sale = await this.findOne(dto.saleId);
    if (!sale) throw new NotFoundException('Sale not found');

    if (Number(sale.balance) <= 0)
      throw new BadRequestException('Sale is already fully paid');

    if (dto.amountPaid > Number(sale.balance))
      throw new BadRequestException(
        'Payment amount exceeds outstanding balance',
      );

    // Update sale balance and status
    const newBalance = Number(sale.balance) - dto.amountPaid;
    const newStatus = newBalance === 0 ? 'FULLY_PAID' : 'PARTIALLY_PAID';

    const updatedSale = await this.prisma.sale.update({
      where: { id: String(dto.saleId) },
      data: {
        balance: newBalance,
        status: newStatus,
      },
    });

    // Record the payment
    await Promise.all(
      dto.paymentMethods.map((method) =>
        this.prisma.salePayments.create({
          data: {
            saleId: String(dto.saleId),
            amount: method.amount, // individual amount per method
            paymentMethod: method.type, // individual payment type
            referenceId: dto.referenceId ? String(dto.referenceId) : null,
            notes: dto.notes,
            cashierId: dto.servedBy,
          },
        }),
      ),
    );

    return {
      message: 'Payment collected successfully',
      data: updatedSale,
    };
  }

  async remove(id: string) {
    const existing = await this.prisma.sale.findUnique({
      where: { id: String(id) },
    });
    if (!existing) throw new NotFoundException(`Sale with ID ${id} not found`);

    await this.prisma.sale.delete({ where: { id: String(id) } });

    return { message: 'Sale deleted successfully' };
  }
}
