import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DepartmentController } from './departments/department.controller';
import { DepartmentService } from './departments/department.service';
import { EmployeeController } from './employees/employee.controller';
import { EmployeeService } from './employees/employee.service';
import { PayrollController } from './payroll/payroll.controller';
import { PayrollService } from './payroll/payroll.service';

@Module({
  controllers: [DepartmentController, EmployeeController, PayrollController],
  providers: [
    DepartmentService,
    PrismaService,
    EmployeeService,
    PayrollService,
  ],
})
export class HumanResourceModule {}
