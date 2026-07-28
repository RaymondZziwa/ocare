import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmployeeController } from './employees/employee.controller';
import { EmployeeService } from './employees/employee.service';

@Module({
  controllers: [EmployeeController],
  providers: [PrismaService, EmployeeService],
})
export class HumanResourceModule {}
