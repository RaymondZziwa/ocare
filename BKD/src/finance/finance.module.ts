// src/events/events.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtService } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { WalletController } from './wallets/wallet.controller';
import { ChannelController } from './withdraw-channels/channel.controller';
import { WalletService } from './wallets/wallet.service';
import { ChannelService } from './withdraw-channels/channel.service';
import { HttpModule } from '@nestjs/axios';
import { TransactionsController } from './transactions/transactions.controller';
import { TransactionService } from './transactions/transactions.service';
import { MarzPayService } from 'src/payments/marzpay.service';
import { ResendMailService } from 'src/utils/mailing/mailing.service';
import { ReceiptService } from 'src/web-app/orders/receiptGeneration.service';
import { VerificationService } from 'src/web-app/auth/verification.service';

@Module({
  imports: [PrismaModule, ConfigModule, HttpModule],
  controllers: [WalletController, ChannelController, TransactionsController],
  providers: [JwtService, WalletService, ChannelService, TransactionService, MarzPayService, ResendMailService, ReceiptService, VerificationService],
})
export class FinanceModule {}
