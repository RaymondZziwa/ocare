import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RoleController } from './roles.controller';
import { RoleService } from './roles.service';

@Module({
  controllers: [RoleController],
  providers: [RoleService, PrismaService],
  exports: [RoleService],
})
export class RoleModule {}
