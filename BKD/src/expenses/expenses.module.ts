import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { BranchExpenseController } from './expenses.controller';
import { BranchExpenseService } from './expenses.service';
import { BillingChannelsController } from './billingChannels.controller';
import { BillingChannelsService } from './billingChannels.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [PrismaModule, ConfigModule, HttpModule],
  providers: [BranchExpenseService, BillingChannelsService],
  controllers: [BranchExpenseController, BillingChannelsController],
})
export class BranchExpenseModule {}
