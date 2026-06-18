import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class MarzPayService {
  private readonly logger = new Logger(MarzPayService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async processCallback(callbackData: any) {
    this.logger.log(
      `Received MarzPay callback: ${JSON.stringify(callbackData)}`,
    );

    console.log('callbackData', callbackData);
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
        console.log('Payment is successful', transaction);
        await this.handleSuccessfulPayment(
          salePayment,
          collection.amount.total,
        );
      } else if (
        transaction.status === 'failed' ||
        transaction.status === 'cancelled'
      ) {
        await this.handleFailedPayment(salePayment);
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

  private async handleSuccessfulPayment(salePayment: any, amount: number) {
    await this.prisma.$transaction(async (tx) => {
      // Update sale status to fully paid
      await tx.sale.update({
        where: { id: salePayment.saleId },
        data: {
          status: 'FULLY_PAID',
          balance: 0,
        },
      });

      // Find and update sales wallet
      const salesWallet = await tx.wallet.findFirst({
        where: { isForSales: true },
      });

      if (salesWallet) {
        await tx.wallet.update({
          where: { id: salesWallet.id },
          data: {
            balance: {
              increment: amount,
            },
          },
        });
      }
    });
  }

  private async handleFailedPayment(salePayment: any) {
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
