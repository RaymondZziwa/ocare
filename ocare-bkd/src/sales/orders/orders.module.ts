import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PrismaService } from 'src/prisma/prisma.service';
import { AppOrdersService } from './orders.service';
import { AppOrdersController } from './orders.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [AppOrdersController],
  providers: [AppOrdersService, PrismaService],
})
export class AppOrdersModule {}
