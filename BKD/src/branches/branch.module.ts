import { Module } from '@nestjs/common';
import { BranchController } from './branch.controller';
import { BranchService } from './branch.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [BranchController],
  providers: [BranchService, PrismaService],
})
export class BranchModule {}
