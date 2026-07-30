import { HttpService } from '@nestjs/axios';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateClientDto } from 'src/dto/client.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { collectPayment } from 'src/utils/payments/collectPayment';
import { CollectionResponse } from '../sales.service';

@Injectable()
export class AppOrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  private async initiateMobileMoneyCollection(
    total: number,
    phoneNumber: string,
  ): Promise<CollectionResponse> {
    const paymentResult = await collectPayment(
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

  async create(dto: CreateClientDto) {
    const client = await this.prisma.client.create({
      data: {
        ...dto,
        fullName: `${dto.firstName} ${dto.lastName}`,
        provider: 'In_Shop',
        email: 'inshop@gmail.com',
        password: 'xx',
      },
    });

    return {
      data: client,
      message: 'Client created successfullly',
      status: 200,
    };
  }

  async findAll() {
    const clients = await this.prisma.client.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return {
      data: clients,
      message: 'Clients fetched successfullly',
      status: 200,
    };
  }

  async findOne(id: string) {
    const client = await this.prisma.client.findUnique({ where: { id } });
    if (!client) throw new NotFoundException(`Client with id ${id} not found`);
    return {
      data: client,
      message: 'Client fetched successfullly',
      status: 200,
    };
  }
  async completeOrder(id: string) {
    const order = await this.prisma.sale.findUnique({
      where: {
        id,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order not found`);
    }

    await this.prisma.sale.update({
      where: {
        id,
      },
      data: {
        saleStatus: 'SUCCESSFUL',
      },
    });

    return {
      message: 'Order status updated successfully',
      data: [],
      status: 200,
    };
  }
  async assignDeliveryAget() {}
  async updateOrder(id: string) {
    const order = await this.prisma.sale.findUnique({
      where: {
        id,
      },
    });
    if (!order) {
      throw new NotFoundException(`Order not found`);
    }

    await this.prisma.saleTimeLine.create({
      data: {
        saleId: id,
        state: 'DELIVERED',
      },
    });

    await this.prisma.sale.update({
      where: {
        id,
      },
      data: {
        saleStatus: 'SUCCESSFUL',
      },
    });

    return {
      message: 'Order updated successfully',
      data: [],
      status: 200,
    };
  }
  async cancelOrder(id: string) {
    const order = await this.prisma.sale.findUnique({
      where: {
        id,
      },
    });
    if (!order) {
      throw new NotFoundException(`Order not found`);
    }

    await this.prisma.sale.delete({
      where: {
        id,
      },
    });

    return {
      message: 'Order cancelled successfully',
      data: [],
      status: 200,
    };
  }

  // async placeAppOrder(data: CreateSaleDto) {
  //   const {
  //     customerId,
  //     servedBy,
  //     storeId,
  //     items,
  //     paymentMethods,
  //     notes,
  //     total,
  //     totalWithCharges,
  //     balance,
  //     status,
  //     phoneNumber,
  //   } = data;
  //   console.log('data', data);
  //   const mobileMoneyMethods = paymentMethods?.filter(
  //     (method) => method.type === 'MTN_MOMO' || method.type === 'AIRTEL_MOMO',
  //   );
  //   const finalSaleStatus = status;
  //   const appStore = await this.prisma.store.findFirst({
  //     where: {
  //       isForAppSales: true,
  //     },
  //   });

  //   const inventories = await this.prisma.productInventory.findMany({
  //     where: {
  //       storeId: appStore?.id,
  //       OR: items.map((item) => ({
  //         itemId: item.id,
  //         unitId: item.unitId,
  //       })),
  //     },
  //   });

  //   // Build lookup map: "itemId-unitId" → inventory
  //   const inventoryMap = new Map(
  //     inventories.map((inv) => [`${inv.itemId}-${inv.unitId}`, inv]),
  //   );

  //   // 2️⃣ Check stock availability
  //   for (const saleItem of items) {
  //     const key = `${saleItem.id}-${saleItem.unitId}`;
  //     const inventory = inventoryMap.get(key);

  //     if (!inventory || inventory.qty < saleItem.quantity) {
  //       throw new BadRequestException(
  //         `Insufficient stock for item "${saleItem.name}". Available: ${inventory?.qty ?? 0}, Required: ${saleItem.quantity}`,
  //       );
  //     }
  //   }

  //   if (!totalWithCharges || !phoneNumber) {
  //     throw new BadRequestException(
  //       'Total with charges and phone number are required',
  //     );
  //   }
  //   const response = await this.initiateMobileMoneyCollection(
  //     totalWithCharges,
  //     phoneNumber,
  //   );
  //   console.log('Mobile money collection response:', response);

  //   console.log('data', data);
  //   console.log('customerId', customerId);
  //   // 4️⃣ Create sale record and payment records inside a transaction
  //   const sale = await this.prisma.$transaction(async (tx) => {
  //     const createdSale = await tx.sale.create({
  //       data: {
  //         clientId: String(customerId),
  //         storeId: appStore?.id || storeId,
  //         status: finalSaleStatus,
  //         saleStatus: 'PENDING',
  //         type: 'Mobile',
  //         total,
  //         balance,
  //         paymentMethods: JSON.parse(JSON.stringify(paymentMethods)),
  //         notes,
  //         items: JSON.parse(JSON.stringify(items)),
  //       },
  //       include: {
  //         client: true,
  //         store: true,
  //         employee: true,
  //       },
  //     });

  //     const salePayments = await Promise.all(
  //       paymentMethods.map((method) =>
  //         tx.salePayments.create({
  //           data: {
  //             saleId: createdSale.id,
  //             amount: method.amount,
  //             paymentMethod: method.type,
  //             referenceId: mobileMoneyMethods.some(
  //               (mobileMethod) => mobileMethod.type === method.type,
  //             )
  //               ? response.data.transaction.reference
  //               : '',
  //             notes,
  //           },
  //         }),
  //       ),
  //     );

  //     console.log('sale payments:', salePayments);
  //     const mobilePayments = salePayments.filter((payment) =>
  //       ['MTN_MOMO', 'AIRTEL_MOMO'].includes(payment.paymentMethod),
  //     );

  //     if (mobilePayments.length > 0) {
  //       await Promise.all(
  //         mobilePayments.map((payment) =>
  //           tx.salePaymentTransactionHistory.create({
  //             data: {
  //               salePaymentId: payment.id,
  //               transaction_uuid: response.data.transaction.uuid,
  //               transaction_reference: response.data.transaction.reference,
  //               provider_transaction_id:
  //                 response.data.transaction.provider_reference,
  //               amount: payment.amount,
  //               amount_formatted: String(payment.amount),
  //               currency: 'UGX',
  //               payment_method: payment.paymentMethod,
  //               provider: response.data.collection.provider,
  //               provider_mode: response.data.collection.mode,
  //               phone_number: response.data.collection.phone_number,
  //               status: 'PENDING',
  //               description: 'Mobile money collection initiated',
  //               notes: 'Mobile money collection initiated',
  //               transaction_initiated_at: response.data.timeline?.initiated_at
  //                 ? new Date(response.data.timeline.initiated_at)
  //                 : null,
  //             },
  //           }),
  //         ),
  //       );
  //     }

  //     return createdSale;
  //   });

  //   return {
  //     message:
  //       'Mobile money collection initiated. Sale will be completed upon successful payment.',
  //     data: { sale, transaction: response.data.transaction },
  //     status: 200,
  //   };
  // }

  async appPendingOrders() {
    const orders = await this.prisma.sale.findMany({
      where: {
        type: {
          in: ['Mobile', 'Web'],
        },
        saleStatus: {
          in: ['PENDING'],
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        employee: true,
        store: true,
        client: true,
      },
    });

    return {
      message: 'Pending orders fetched successfully',
      data: orders,
      status: 200,
    };
  }

  async appOrderHistory() {
    const orders = await this.prisma.sale.findMany({
      where: {
        type: {
          in: ['Mobile', 'Web'],
        },
        saleStatus: {
          not: 'PENDING', // Exclude pending status
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        employee: true,
        store: true,
        client: true,
      },
    });

    return {
      message: 'App order history fetched successfully',
      data: orders,
      status: 200,
    };
  }

  // async getPaymentStatus(transactionId: string) {
  //   const transaction =
  //     await this.prisma.salePaymentTransactionHistory.findFirst({
  //       where: {
  //         transaction_reference: transactionId,
  //       },
  //       orderBy: {
  //         created_at: 'desc',
  //       },
  //     });

  //   if (!transaction) {
  //     throw new NotFoundException('Transaction not found');
  //   }

  //   return {
  //     message: 'Payment status fetched successfully',
  //     data: {
  //       status: transaction.status,
  //       transaction: transaction,
  //     },
  //     status: 200,
  //   };
  // }

  async getAppUserOrders(id: string) {
    const orders = await this.prisma.sale.findMany({
      where: {
        clientId: id,
        type: 'Mobile',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      message: 'App user past orders fetched successfully',
      data: orders,
      status: 200,
    };
  }
}
