import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AppOrdersService } from './orders.service';
import { AppOrdersController } from './orders.controller';

@Module({
  controllers: [AppOrdersController],
  providers: [AppOrdersService, PrismaService],
})
export class AppOrdersModule {}
