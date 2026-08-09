import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { GenericResponse } from 'src/utils/genericResponse';
import { WithdrawToBankDto } from './dtos/transferToBank.dto';
import { firstValueFrom } from 'rxjs';
import { IWebhookCallback } from './types';
import { MobileMoneyPaymentDto } from './dtos/sendMomo.dto';
import { MarzPayService } from 'src/sales/marz/marz.service';

@Injectable()
export class TransactionService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly marzService: MarzPayService,
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
    const inventories = await this.prismaService.productInventory.findMany({
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

      await this.prismaService.productInventory.update({
        where: { id: inventory.id },
        data: {
          qty: inventory.qty - saleItem.quantity,
        },
      });
    }
  }

  async withdraw(data: WithdrawToBankDto): Promise<GenericResponse> {
    //use the channelId to get the withdraw channel details --bank_name, bank_account_number, bank_account_name
    const channel = await this.prismaService.withdrawChannel.findUnique({
      where: { id: data.channelId },
    });

    if (!channel) {
      return {
        status: 404,
        data: null,
        message: 'Withdraw channel not found',
      };
    }

    let amountToWithdraw = 0;

    if (data.amount < 250001) {
      amountToWithdraw = data.amount - 5000;
    } else if (data.amount > 250001 && data.amount < 500001) {
      amountToWithdraw = data.amount - 6000;
    } else if (data.amount > 500001 && data.amount < 1000001) {
      amountToWithdraw = data.amount - 9000;
    } else if (data.amount > 1000001 && data.amount < 2000001) {
      amountToWithdraw = data.amount - 13500;
    } else if (data.amount > 2000001 && data.amount < 50000000) {
      amountToWithdraw = data.amount - 16500;
    }

    //call the marz api to initiate the transfer to bank
    const payload = {
      amount: amountToWithdraw,
      description: data.description,
      bank_name: channel.bank,
      bank_account_number: channel.accountNumber,
      bank_account_name: channel.name,
      wallet_source: this.configService.getOrThrow<string>('MARZ_WALLET_SRC'),
      callback_url: this.configService.getOrThrow<string>('MARZ_CALLBACK_URL'),
    };

    const authHeader = this.configService.get<string>('MARZ_AUTH_HEADER');

    //get them from the withdraw request response
    const response = await firstValueFrom(
      this.httpService.post(
        this.configService.getOrThrow<string>('MARZ_TRANSFER_BASE_URL'),
        payload,
        {
          headers: {
            Authorization: `Basic ${authHeader}`,
            'Content-Type': 'application/json',
          },
        },
      ),
    );

    //complete the transfer , deduct the amount from the wallet balance --move to the check status function before deployment
    await this.prismaService.wallet.update({
      where: { id: data.internalWalletId },
      data: {
        balance: {
          decrement: Number(data.amount) || 0,
        },
      },
    });
    console.log('Marz transfer response:', response.data);

    //create the transfer transaction record in the database with status pending
    const transaction = await this.prismaService.withdrawHistory.create({
      data: {
        amount: data.amount,
        walletId: data.internalWalletId,
        description: data.description,
        channelId: data.channelId,
        status: 'PENDING',
        reference: response.data.data.bank_transfer.reference,
      },
    });
    return {
      status: 200,
      data: transaction,
      message: 'Transaction created successfully',
    };
  }

  async checkPaymentStatus(reference: { reference: string }) {
    //call the marz api to check the transfer status using the reference id
    const payment = await this.prismaService.salePayment.findUnique({
      where: { transaction_reference: reference.reference },
    });
    if (!payment) {
      return {
        status: 404,
        data: null,
        message: 'Payment transaction not found',
      };
    }

    if (payment.status === 'COMPLETED') {
      console.log(payment);
      await this.marzService.handleSuccessfulPayment(
        payment,
        parseInt(payment.amount.toString()),
      );
      return {
        status: 200,
        data: {
          status: payment.status,
        },
        message: 'Payment completed',
      };
    }

    if (payment.status === 'FAILED') {
      await this.marzService.handleSuccessfulPayment(
        payment,
        parseInt(payment.amount.toString()),
      );
      return {
        status: 200,
        data: {
          status: payment.status,
        },
        message: 'Payment failed',
      };
    }

    if (payment.status === 'PENDING') {
      return {
        status: 200,
        data: {
          status: payment.status,
        },
        message: 'Payment still pending',
      };
    }
  }

  async findAll(): Promise<GenericResponse> {
    const channels = await this.prismaService.withdrawChannel.findMany();
    return {
      status: 200,
      data: channels,
      message: 'Channels fetched successfully',
    };
  }

  async marzCallback(data: IWebhookCallback): Promise<GenericResponse> {
    const paymentStatus = data.transaction.status;
    const reference = data.transaction.reference;
    const newStatus =
      paymentStatus.toLowerCase() === 'completed'
        ? 'COMPLETED'
        : paymentStatus === 'failed'
          ? 'FAILED'
          : 'PENDING';

    const salePayment = await this.prismaService.salePayment.findFirst({
      where: { transaction_reference: reference },
    });

    const salesWallet = await this.prismaService.wallet.findFirst({
      where: { isForSales: true },
    });

    const sale = await this.prismaService.sale.findUnique({
      where: { salePaymentId: salePayment?.id },
    });

    //Update the transaction record in the database with the new status
    await this.prismaService.salePayment.updateMany({
      where: { transaction_reference: reference },
      data: {
        status: newStatus,
        transaction_completed_at: new Date(),
        provider_transaction_id: data?.collection?.provider_transaction_id,
      },
    });
    if (paymentStatus.toLowerCase() === 'completed') {
      //Update wallet
      if (!salesWallet) {
        throw new Error('Sales wallet not found');
      }

      await this.prismaService.wallet.update({
        where: { id: salesWallet.id },
        data: {
          balance: {
            increment: Number(salePayment?.amount) || 0,
          },
        },
      });

      await this.prismaService.sale.update({
        where: { salePaymentId: salePayment?.id },
        data: {
          saleStatus: 'SUCCESSFUL',
        },
      });

      if (sale) {
        //complete the sale , deduct stock
        const saleItems = JSON.parse(JSON.stringify(sale.items));
        await this.deductStockForSale(sale.id, sale?.storeId, saleItems);
      }
    } else {
      await this.prismaService.sale.update({
        where: { salePaymentId: salePayment?.id },
        data: {
          saleStatus: 'FAILED',
        },
      });
    }
    return {
      status: 200,
      data: {
        eventType: data.event_type,
        transaction: data.transaction,
        collection: data.collection,
        disbursement: data.disbursement,
      },
      message: `Webhook received. Transaction status: ${paymentStatus}`,
    };
  }

  async allTransactions(): Promise<GenericResponse> {
    const transactions = await this.prismaService.salePayment.findMany({
      orderBy: {
        created_at: 'desc',
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
    return {
      status: 200,
      data: transactions,
      message: 'Transactions fetched successfully',
    };
  }

  async checkBankTransferStatus(reference: { reference: string }) {
    const transfer = await this.prismaService.withdrawHistory.findUnique({
      where: { reference: reference.reference },
    });
    if (!transfer) {
      return {
        status: 404,
        data: null,
        message: 'Transfer transaction not found',
      };
    }

    const authHeader = this.configService.get<string>('MARZ_AUTH_HEADER');

    //get them from the withdraw request response
    const response = await firstValueFrom(
      this.httpService.get(
        `https://wallet.wearemarz.com/api/bank-transfer/${reference.reference}`,
        {
          headers: {
            Authorization: `Basic ${authHeader}`,
            'Content-Type': 'application/json',
          },
        },
      ),
    );

    console.log('Marz bank transfer status response:', response.data);

    if (response.data.status.toLowerCase() === 'success') {
      await this.prismaService.withdrawHistory.update({
        where: { reference: reference.reference },
        data: {
          status: 'COMPLETED',
          transaction_completed_at: new Date(),
        },
      });

      await this.prismaService.wallet.update({
        where: { id: transfer.walletId },
        data: {
          balance: {
            decrement: Number(transfer.amount) || 0,
          },
        },
      });
    }
    return {
      status: 200,
      data: {
        status: transfer.status,
      },
      message: 'Transfer status fetched successfully',
    };
  }

  async sendMoneyToPersonViaMomo(data: MobileMoneyPaymentDto) {
    const authHeader = this.configService.get<string>('MARZ_AUTH_HEADER');

    const payload = {
      amount: data.amount,
      phone_number: data.phone_number,
      country: data.country,
      reference: data.reference,
      description: data.description,
      callback_url: this.configService.getOrThrow<string>('MARZ_CALLBACK_URL'),
    };

    const response = await firstValueFrom(
      this.httpService.post(
        this.configService.getOrThrow<string>('MARZ_MOMO_PAYMENT_URL'),
        payload,
        {
          headers: {
            Authorization: `Basic ${authHeader}`,
            'Content-Type': 'application/json',
          },
        },
      ),
    );

    console.log('Marz mobile money payment response:', response.data);

    return {
      status: 200,
      data: response.data,
      message: 'Mobile money payment initiated successfully',
    };
  }
}
