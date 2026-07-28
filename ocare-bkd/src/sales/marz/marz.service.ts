import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResendMailService } from 'src/utils/mailing/mailing.service';
import { ReceiptService } from 'src/web-app/orders/receiptGeneration.service';
import { Decimal } from '@prisma/client/runtime/client';

@Injectable()
export class MarzPayService {
  private readonly logger = new Logger(MarzPayService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly resendMailService: ResendMailService,
    private readonly receiptService: ReceiptService,
  ) {}

  private async deductStockForSale(
    saleId: string,
    storeId: string,
    items: Array<{
      id: string;
      name: string;
      quantity: number;
      unitId: string;
    }>,
  ): Promise<void> {
    // Fetch all inventories for the store in one query
    const inventories = await this.prisma.productInventory.findMany({
      where: {
        storeId: storeId,
        OR: items.map((item) => ({
          itemId: item.id,
          unitId: item.unitId,
        })),
      },
    });

    // Build lookup map
    const inventoryMap = new Map(
      inventories.map((inv) => [`${inv.itemId}-${inv.unitId}`, inv]),
    );

    // Check and deduct stock for each item
    for (const saleItem of items) {
      const key = `${saleItem.id}-${saleItem.unitId}`;
      const inventory = inventoryMap.get(key);

      if (!inventory) {
        throw new Error(
          `Inventory record not found for item "${saleItem.name}"`,
        );
      }

      if (inventory.qty < saleItem.quantity) {
        throw new Error(
          `Insufficient stock for item "${saleItem.name}". Available: ${inventory.qty}, Required: ${saleItem.quantity}`,
        );
      }

      await this.prisma.productInventory.update({
        where: { id: inventory.id },
        data: {
          qty: inventory.qty - saleItem.quantity,
        },
      });
    }
  }

  async processCallback(callbackData: any) {
    // this.logger.log(
    //   `Received MarzPay callback: ${JSON.stringify(callbackData)}`,
    // );

    // console.log('callbackData', callbackData);
    try {
      const { transaction, collection } = callbackData;

      // Find the sale payment record by reference
      const salePayment = await this.prisma.salePayment.findFirst({
        where: {
          transaction_reference: transaction.reference,
        },
      });

      if (!salePayment) {
        this.logger.warn(
          `No sale payment found for reference: ${transaction.reference}`,
        );
        return { status: 'error', message: 'Payment not found' };
      }

      // Update the sale payment status based on callback
      await this.prisma.salePayment.update({
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
        // await this.handleSuccessfulPayment(
        //   salePayment,
        //   collection.amount.total,
        // );
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

  async handleSuccessfulPayment(salePayment: any, amount: number) {
    await this.prisma.$transaction(async (tx) => {
      const saleP = await tx.salePayment.findUniqueOrThrow({
        where: {
          id: salePayment?.id,
        },
      });

      if (!saleP) throw new NotFoundException('Sale payment not found');

      const sale = await tx.sale.findUniqueOrThrow({
        where: {
          salePaymentId: saleP.id,
        },
        include: {
          client: true,
        },
      });

      let wallet: {
        id: string;
        updatedAt: Date;
        createdAt: Date;
        name: string;
        balance: Decimal;
        purpose: string | null;
        isForSales: boolean;
        isForAppSales: boolean;
        canBeDeleted: boolean;
      } | null;

      if (sale.type == 'Web') {
        wallet = await tx.wallet.findFirst({
          where: {
            isForAppSales: true,
          },
        });
        // After transaction commits, generate and send receipt
        try {
          await this.deductStockForSale(
            sale.id,
            sale?.storeId,
            JSON.parse(JSON.stringify(sale?.items)),
          );
          // Generate PDF buffer
          const pdfBuffer =
            await this.receiptService.generateReceiptBuffer(sale);

          // Prepare order data for email
          const orderData = {
            date: sale.createdAt,
            items:
              Array.isArray(sale.items) &&
              sale?.items.map((item: any) => ({
                name: item.product?.name || item.name || 'Product',
                quantity: item.quantity,
                price: item.unitPrice || item.price,
              })),
            total: amount,
          };

          // Send email with PDF attached
          await this.resendMailService.sendOrderConfirmation(
            `${sale.client.firstName} ${sale.client.lastName}` || 'Customer',
            sale.client?.email,
            orderData,
            pdfBuffer,
          );
        } catch (error) {
          // Log error but do not rollback transaction (order is already successful)
          console.error('Failed to send receipt email:', error);
          // Optionally notify admin
        }
      } else if (sale.type === 'Mobile') {
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
        where: { salePaymentId: salePayment.id },
        data: {
          status: 'FULLY_PAID',
        },
      });

      await tx.salePayment.update({
        where: { id: salePayment?.id },
        data: {
          status: 'COMPLETED',
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
    console.log('sdds failed', salePayment);
    await this.prisma.sale.update({
      where: { salePaymentId: salePayment.id },
      data: {
        status: 'UNPAID',
        saleStatus: 'FAILED',
      },
    });

    await this.prisma.salePayment.update({
      where: { id: salePayment.id },
      data: {
        status: 'FAILED',
      },
    });
  }

  async checkTransactionStatus(reference: string) {
    try {
      const salePayment = await this.prisma.salePayment.findFirst({
        where: {
          transaction_reference: reference,
        },
      });

      if (!salePayment) throw new NotFoundException('Payment not found');

      if (salePayment.status === 'COMPLETED') {
        return {
          status: 'COMPLETED',
          message: 'Payment recieved',
        };
      } else if (salePayment.status === 'FAILED') {
        return {
          status: 'FAILED',
          message: 'Payment failed',
        };
      } else {
        return {
          status: 'PENDING',
          message: 'Payment pending',
        };
      }
    } catch (error) {
      console.log(error);
      this.logger.error(`Error checking transaction status: ${error.message}`);
      return {
        status: 'error',
        message: error.message,
      };
    }
  }
}
