import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ChannelController } from './channels/channel.controller';
import { ChannelService } from './channels/channel.service';
import { WalletService } from './wallets/wallet.service';
import { WalletController } from './wallets/wallet.controller';
import { HttpModule } from '@nestjs/axios';
import { TransactionsController } from './transactions/transactions.controller';
import { TransactionService } from './transactions/transactions.service';
import { MarzPayService } from 'src/sales/marz/marz.service';
import { ResendMailService } from 'src/utils/mailing/mailing.service';
import { ReceiptService } from 'src/web-app/orders/receiptGeneration.service';
import { VerificationService } from 'src/web-app/auth/verification.service';

@Module({
  imports: [HttpModule],
  controllers: [ChannelController, WalletController, TransactionsController],
  providers: [
    WalletService,
    ChannelService,
    PrismaService,
    JwtService,
    ConfigService,
    TransactionService,
    MarzPayService,
    ResendMailService,
    ReceiptService,
    VerificationService,
  ],
})
export class FinanceModule {}
