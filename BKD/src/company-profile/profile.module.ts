import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CompanyController } from './profile.controller';
import { CompanyService } from './profile.service';

@Module({
  controllers: [CompanyController],
  providers: [CompanyService, PrismaService],
})
export class CompanyModule {}
