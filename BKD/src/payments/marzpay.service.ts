import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { firstValueFrom } from 'rxjs';
import { Decimal } from '@prisma/client/runtime/library';
import { ResendMailService } from 'src/utils/mailing/mailing.service';
import { ReceiptService } from 'src/web-app/orders/receiptGeneration.service';

@Injectable()
export class MarzPayService {
  private readonly logger = new Logger(MarzPayService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly resendMailService: ResendMailService,
    private readonly receiptService: ReceiptService,
  ) {}

  async processCallback(callbackData: any) {
    // this.logger.log(
    //   `Received MarzPay callback: ${JSON.stringify(callbackData)}`,
    // );

    // console.log('callbackData', callbackData);
    try {
      const { transaction, collection, timeline, metadata } = callbackData;

      // Find the sale payment record by reference
      const salePayment = await this.prisma.salePayments.findFirst({
        where: {
          referenceId: transaction.reference,
        },
        include: {
          sale: true,
        },
      });

      if (!salePayment) {
        this.logger.warn(
          `No sale payment found for reference: ${transaction.reference}`,
        );
        return { status: 'error', message: 'Payment not found' };
      }

      // Update the sale payment status based on callback
      await this.prisma.salePayments.update({
        where: { id: salePayment.id },
        data: {
          notes: `Payment status: ${transaction.status} | Provider Ref: ${transaction.provider_reference}`,
        },
      });

      // If payment is successful, update the sale status and wallet balance
      if (
        transaction.status === 'success' ||
        transaction.status === 'completed'
      ) {
        await this.handleSuccessfulPayment(
          salePayment,
          collection.amount.total,
        );
      } else if (
        transaction.status === 'failed' ||
        transaction.status === 'cancelled'
      ) {
        await this.handleSuccessfulPayment(
          salePayment,
          collection.amount.total,
        );
        //await this.handleFailedPayment(salePayment);
      }

      return {
        status: 'success',
        message: 'Callback processed successfully',
        transactionStatus: transaction.status,
      };
    } catch (error) {
      this.logger.error(`Error processing callback: ${error.message}`);
      return { status: 'error', message: error.message };
    }
  }

  async handleSuccessfulPayment(salePayment: any, amount: number) {
    await this.prisma.$transaction(async (tx) => {
      const saleP = await tx.salePayments.findUniqueOrThrow({
        where: {
          id: salePayment?.salePaymentId,
        },
      });

      if (!saleP) throw new NotFoundException('Sale payment not found')
      
      const sale = await tx.sale.findUniqueOrThrow({
        where: {
          id: saleP.saleId
        }
      })

      let wallet: {
        id: number;
        updatedAt: Date;
        createdAt: Date;
        name: string;
        balance: Decimal;
        purpose: string | null;
        isForSales: boolean;
        isForAppSales: boolean;
        canBeDeleted: boolean;
      } | null;

      console.log('sale',sale)
      if (sale.type === 'WEB') {
        wallet = await tx.wallet.findFirst({
          where: {
            isForWebSales: true,
          },
        });
        // After transaction commits, generate and send receipt
        try {
          // Generate PDF buffer
          const pdfBuffer =
            await this.receiptService.generateReceiptBuffer(sale);

          console.log('sale')
          // Prepare order data for email
          const orderData = {
            date: sale.createdAt,
            items: Array.isArray(sale.items) && sale?.items.map((item: any) => ({
              name: item.product?.name || item.name || 'Product',
              quantity: item.quantity,
              price: item.unitPrice || item.price,
            })),
            total: amount,
          };

          // Send email with PDF attached
          await this.resendMailService.sendOrderConfirmation(
            sale.clientId || 'Customer',
            'raymondzian@gmail.com',
            //sale.client?.email,
            orderData,
            pdfBuffer,
          );
        } catch (error) {
          // Log error but do not rollback transaction (order is already successful)
          console.error('Failed to send receipt email:', error);
          // Optionally notify admin
        }
      } else if (sale.type === 'APP') {
        wallet = await tx.wallet.findFirst({
          where: {
            isForAppSales: true,
          },
        });
      } else {
        wallet = await tx.wallet.findFirst({
          where: {
            isForSales: true,
          },
        });
      }

      // Update sale status to fully paid
      await tx.sale.update({
        where: { id: salePayment.saleId },
        data: {
          status: 'FULLY_PAID',
          balance: 0,
        },
      });

      if (wallet) {
        await tx.wallet.update({
          where: { id: wallet.id },
          data: {
            balance: {
              increment: amount,
            },
          },
        });
      }
    });
  }

  async handleFailedPayment(salePayment: any) {
    // Update sale status to unpaid if payment failed
    await this.prisma.sale.update({
      where: { id: salePayment.saleId },
      data: {
        status: 'UNPAID',
      },
    });
  }

  async checkTransactionStatus(reference: string) {
    try {
      const baseUrl = this.configService.get<string>(
        'MARZ_COLLECTION_BASE_URL',
      );
      const authHeader = this.configService.get<string>('MARZ_AUTH_HEADER');

      const response = await firstValueFrom(
        this.httpService.get(`${baseUrl}/status/${reference}`, {
          headers: {
            Authorization: authHeader,
          },
        }),
      );

      return {
        status: 'success',
        data: response.data,
      };
    } catch (error) {
      this.logger.error(`Error checking transaction status: ${error.message}`);
      return {
        status: 'error',
        message: error.message,
      };
    }
  }
}
