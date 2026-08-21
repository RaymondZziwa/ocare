import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateDraftSaleDto } from 'src/dto/draftSale.dto';
import { CreateSaleDto } from 'src/dto/pos.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResendMailService } from 'src/utils/mailing/mailing.service';
import { collectPayment } from 'src/utils/payments/collectPayment';
import { QuotationService } from 'src/web-app/orders/quotationGeneration.service';

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
    private readonly resendMailService: ResendMailService,
    private readonly quotationService: QuotationService,
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
      amountToCharge,
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
        source === 'In_shop' ? amountToCharge : totalWithDelivery,
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

    const items = existing.items as Array<{
      id: string;
      unitId: string;
      quantity: number;
      batchId?: string;
    }>;

    await this.prisma.$transaction(async (tx) => {
      // Restore inventory quantities for each sale item
      for (const item of items) {
        // Restore product inventory
        const productInventory = await tx.productInventory.findFirst({
          where: {
            storeId: existing.storeId,
            itemId: item.id,
            unitId: item.unitId,
          },
        });

        if (productInventory) {
          await tx.productInventory.update({
            where: { id: productInventory.id },
            data: {
              qty: {
                increment: item.quantity,
              },
            },
          });
        }

        // Restore batch inventory
        if (item.batchId) {
          const batchInventory = await tx.batchInventory.findFirst({
            where: {
              batchId: item.batchId,
              storeId: existing.storeId,
            },
          });

          if (batchInventory) {
            await tx.batchInventory.update({
              where: { id: batchInventory.id },
              data: {
                quantity: {
                  increment: item.quantity,
                },
              },
            });
          }
        }
      }

      // Delete the sale
      await tx.sale.delete({ where: { id: id } });
    });

    return { message: 'Sale deleted successfully' };
  }

  async updateSale(id: string, updateSaleDto: CreateSaleDto) {
    // Get the existing sale
    const existingSale = await this.prisma.sale.findUnique({
      where: { id },
      include: {
        client: true,
        store: true,
        employee: true,
      },
    });

    if (!existingSale) {
      throw new NotFoundException(`Sale with ID ${id} not found`);
    }

    const {
      customerId,
      servedBy,
      source,
      items: newItems,
      paymentMethod,
      notes,
      total,
      totalWithDelivery,
    } = updateSaleDto;

    const oldItems = existingSale.items as Array<{
      id: string;
      unitId: string;
      quantity: number;
      name: string;
    }>;

    return this.prisma.$transaction(async (tx) => {
      // 1️⃣ Fetch inventory matching itemId + unitId in this store
      const inventories = await tx.productInventory.findMany({
        where: {
          storeId: existingSale.storeId,
          OR: [...oldItems, ...newItems].map((item) => ({
            itemId: item.id,
            unitId: item.unitId,
          })),
        },
      });

      // Build lookup map: "itemId-unitId" → inventory
      const inventoryMap = new Map(
        inventories.map((inv) => [`${inv.itemId}-${inv.unitId}`, inv]),
      );

      // 2️⃣ Restore old quantities (add back to inventory)
      for (const oldItem of oldItems) {
        const key = `${oldItem.id}-${oldItem.unitId}`;
        const inventory = inventoryMap.get(key);

        if (inventory) {
          await tx.productInventory.update({
            where: { id: inventory.id },
            data: {
              qty: inventory.qty + oldItem.quantity,
            },
          });
        }
      }

      // 3️⃣ Check stock availability for new items
      for (const newItem of newItems) {
        const key = `${newItem.id}-${newItem.unitId}`;
        const inventory = inventoryMap.get(key);

        if (!inventory || inventory.qty < newItem.quantity) {
          throw new BadRequestException(
            `Insufficient stock for item "${newItem.name}". Available: ${inventory?.qty ?? 0}, Required: ${newItem.quantity}`,
          );
        }
      }

      // 4️⃣ Reduce inventory quantities for new items
      for (const newItem of newItems) {
        const key = `${newItem.id}-${newItem.unitId}`;
        const inventory = inventoryMap.get(key);

        if (!inventory) {
          throw new BadRequestException(
            `Inventory record not found for item "${newItem.name}"`,
          );
        }

        await tx.productInventory.update({
          where: { id: inventory.id },
          data: {
            qty: inventory.qty - newItem.quantity,
          },
        });
      }

      // 5️⃣ Update sale payment if exists
      if (existingSale.salePaymentId) {
        await tx.salePayment.update({
          where: { id: existingSale.salePaymentId },
          data: {
            amount: totalWithDelivery,
            notes,
            cashierId: servedBy,
          },
        });
      }

      // 6️⃣ Update sale record
      const updatedSale = await tx.sale.update({
        where: { id },
        data: {
          clientId: String(customerId),
          servedBy,
          type: source,
          storeId: existingSale.storeId,
          total,
          paymentMethod,
          notes,
          items: newItems,
        },
        include: {
          client: true,
          store: true,
          employee: true,
        },
      });

      // 7️⃣ Add timeline entry for update
      await tx.saleTimeLine.create({
        data: {
          saleId: updatedSale.id,
          state: 'UPDATED',
        },
      });

      return {
        message: 'Sale updated successfully',
        data: updatedSale,
        status: 200,
      };
    });
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

  async saveDraft(dto: CreateDraftSaleDto) {
    if (dto.customerId) {
      const customer = await this.prisma.client.findUnique({
        where: {
          id: dto.customerId,
        },
      });

      if (!customer) {
        throw new BadRequestException('Customer not found.');
      }
    }

    const draft = await this.prisma.draftSale.upsert({
      where: {
        id: dto.id,
      },
      update: {
        customerId: dto.customerId || null,
        cart: dto.cart,
        paymentMethod: dto.paymentMethod,
        amountPaid: dto.amountPaid,
        notes: dto.notes,
        phoneNumber: dto.phoneNumber,
      },
      create: {
        customerId: dto.customerId || null,
        cart: dto.cart,
        paymentMethod: dto.paymentMethod,
        amountPaid: dto.amountPaid,
        notes: dto.notes,
        phoneNumber: dto.phoneNumber,
      },
    });

    return {
      status: 200,
      message: 'Draft saved successfully.',
      data: draft,
    };
  }

  async getAllDraftSales() {
    const drafts = await this.prisma.draftSale.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return {
      status: 200,
      message: 'Drafts retrieved successfully.',
      data: drafts,
    };
  }

  async getQuotation(email: string, draftId: string) {
    const draft = await this.prisma.draftSale.findUnique({
      where: { id: draftId },
    });

    if (!draft) {
      throw new BadRequestException('Customer or draft not found.');
    }

    // Generate the PDF
    const pdfBuffer =
      await this.quotationService.generateQuotationBuffer(draft);

    // Send the email with attachment
    await this.resendMailService.sendQuotation({
      to: email,
      draft,
      pdfBuffer,
      // subject is optional
    });

    return { message: 'Quotation sent successfully' };
  }

  async deleteDraft(draftId: string) {
    await this.prisma.draftSale.delete({
      where: {
        id: draftId,
      },
    });

    return {
      message: 'Draft deleted successfully',
    };
  }
}
