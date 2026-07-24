// import {
//   BadRequestException,
//   Injectable,
//   InternalServerErrorException,
//   NotFoundException,
// } from '@nestjs/common';
// import { PrismaService } from 'src/prisma/prisma.service';
// import { ConfigService } from '@nestjs/config';
// import { ResendMailService } from 'src/utils/mailing/mailing.service';
// import { CreateSaleDto } from 'src/dto/pos.dto';
// import { CollectionResponse } from 'src/sales/pos/pos.service';
// import { HttpService } from '@nestjs/axios';
// import { collectPayment } from 'src/utils/payments/collectPayment';

// @Injectable()
// export class WebOrdersService {
//   constructor(
//     private readonly prisma: PrismaService,
//     private readonly configService: ConfigService,
//     private readonly resendMailService: ResendMailService,
//     private readonly httpService: HttpService,
//   ) {}

//   private async initiateMobileMoneyCollection(
//     total: number,
//     phoneNumber: string,
//   ): Promise<CollectionResponse> {
//     const paymentResult = await collectPayment(
//       this.httpService,
//       this.configService,
//       {
//         amount: total,
//         phone_number: phoneNumber,
//         country: 'UG',
//         description: 'POS Sale Payment',
//       },
//     );

//     return paymentResult;
//   }

//   async getOrderHistory(clientId: string) {
//     try {
//       const pastOrders = await this.prisma.sale.findMany({
//         where: {
//           clientId,
//           type: 'WEB',
//         },

//         orderBy: { createdAt: 'desc' },
//       });

//       return {
//         data: pastOrders,
//         message: 'Your order history has been retrieved successfully',
//       };
//     } catch {
//       throw new InternalServerErrorException(
//         'There was an error while fetching your order history',
//       );
//     }
//   }

//   async placeAppOrder(data: CreateSaleDto) {
//     const {
//       customerId,
//       servedBy,
//       storeId,
//       items,
//       paymentMethods,
//       notes,
//       total,
//       totalWithCharges,
//       balance,
//       status,
//       phoneNumber,
//     } = data;
//     const mobileMoneyMethods = paymentMethods?.filter(
//       (method) => method.type === 'MTN_MOMO' || method.type === 'AIRTEL_MOMO',
//     );
//     const finalSaleStatus = status;
//     const appStore = await this.prisma.store.findFirst({
//       where: {
//         isForAppSales: true,
//       },
//     });

//     const inventories = await this.prisma.productInventory.findMany({
//       where: {
//         storeId: appStore?.id,
//         OR: items.map((item) => ({
//           itemId: item.id,
//           unitId: item.unitId,
//         })),
//       },
//     });

//     // Build lookup map: "itemId-unitId" → inventory
//     const inventoryMap = new Map(
//       inventories.map((inv) => [`${inv.itemId}-${inv.unitId}`, inv]),
//     );

//     // 2️⃣ Check stock availability
//     for (const saleItem of items) {
//       const key = `${saleItem.id}-${saleItem.unitId}`;
//       const inventory = inventoryMap.get(key);

//       if (!inventory || inventory.qty < saleItem.quantity) {
//         throw new BadRequestException(
//           `Insufficient stock for item "${saleItem.name}". Available: ${inventory?.qty ?? 0}, Required: ${saleItem.quantity}`,
//         );
//       }
//     }

//     if (!totalWithCharges || !phoneNumber) {
//       throw new BadRequestException(
//         'Total with charges and phone number are required',
//       );
//     }
//     const response = await this.initiateMobileMoneyCollection(
//       totalWithCharges,
//       phoneNumber,
//     );
//     console.log('Mobile money collection response:', response);

//     console.log('data', data);
//     console.log('customerId', customerId);
//     // 4️⃣ Create sale record and payment records inside a transaction
//     const sale = await this.prisma.$transaction(async (tx) => {
//       const createdSale = await tx.sale.create({
//         data: {
//           clientId: String(customerId),
//           storeId: appStore?.id || storeId,
//           status: finalSaleStatus,
//           saleStatus: 'PENDING',
//           type: 'WEB',
//           total,
//           balance,
//           paymentMethods: JSON.parse(JSON.stringify(paymentMethods)),
//           notes,
//           items: JSON.parse(JSON.stringify(items)),
//         },
//         include: {
//           client: true,
//           store: true,
//           employee: true,
//         },
//       });

//       const salePayments = await Promise.all(
//         paymentMethods.map((method) =>
//           tx.salePayments.create({
//             data: {
//               saleId: createdSale.id,
//               amount: method.amount,
//               paymentMethod: method.type,
//               referenceId: mobileMoneyMethods.some(
//                 (mobileMethod) => mobileMethod.type === method.type,
//               )
//                 ? response.data.transaction.reference
//                 : '',
//               notes,
//             },
//           }),
//         ),
//       );

//       console.log('sale payments:', salePayments);
//       const mobilePayments = salePayments.filter((payment) =>
//         ['MTN_MOMO', 'AIRTEL_MOMO'].includes(payment.paymentMethod),
//       );

//       if (mobilePayments.length > 0) {
//         await Promise.all(
//           mobilePayments.map((payment) =>
//             tx.salePaymentTransactionHistory.create({
//               data: {
//                 salePaymentId: payment.id,
//                 transaction_uuid: response.data.transaction.uuid,
//                 transaction_reference: response.data.transaction.reference,
//                 provider_transaction_id:
//                   response.data.transaction.provider_reference,
//                 amount: payment.amount,
//                 amount_formatted: String(payment.amount),
//                 currency: 'UGX',
//                 payment_method: payment.paymentMethod,
//                 provider: response.data.collection.provider,
//                 provider_mode: response.data.collection.mode,
//                 phone_number: response.data.collection.phone_number,
//                 status: 'PENDING',
//                 description: 'Mobile money collection initiated',
//                 notes: 'Mobile money collection initiated',
//                 transaction_initiated_at: response.data.timeline?.initiated_at
//                   ? new Date(response.data.timeline.initiated_at)
//                   : null,
//               },
//             }),
//           ),
//         );
//       }

//       return createdSale;
//     });

//     return {
//       message:
//         'Mobile money collection initiated. Sale will be completed upon successful payment.',
//       data: { sale, transaction: response.data.transaction },
//       status: 200,
//     };
//   }
// }
