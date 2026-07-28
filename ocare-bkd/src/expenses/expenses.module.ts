import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { BranchExpenseController } from './expenses.controller';
import { BranchExpenseService } from './expenses.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [PrismaModule, ConfigModule, HttpModule],
  providers: [BranchExpenseService],
  controllers: [BranchExpenseController],
})
export class BranchExpenseModule {}
