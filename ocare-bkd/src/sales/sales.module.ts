import { Module } from '@nestjs/common';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { MarzPayService } from './marz/marz.service';
import { MarzController } from './marz/marz.controller';
import { ResendMailService } from 'src/utils/mailing/mailing.service';
import { ReceiptService } from 'src/web-app/orders/receiptGeneration.service';
import { VerificationService } from 'src/web-app/auth/verification.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [ConfigModule, HttpModule],
  controllers: [SalesController, MarzController],
  providers: [
    PrismaService,
    SalesService,
    MarzPayService,
    ResendMailService,
    ReceiptService,
    VerificationService,
    JwtService
  ],
})
export class SalesModule {}
