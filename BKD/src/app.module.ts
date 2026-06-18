import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { BranchModule } from './branches/branch.module';
import { PrismaModule } from './prisma/prisma.module';
import { RoleModule } from './roles/roles.module';
import { CompanyModule } from './company-profile/profile.module';
import { ClientModule } from './sales/customers/customer.module';
import { HumanResourceModule } from './humanResource/humanResource.module';
import { AuthModule } from './auth/auth.module';
import { InventoryModule } from './inventory/inventory.module';
import { BranchExpenseModule } from './expenses/expenses.module';
import { PosModule } from './sales/pos/pos.module';
import { ReportsModule } from './reports/reports.module';
import { ScheduleModule } from '@nestjs/schedule';
import { FinanceModule } from './finance/finance.module';
import { AppOrdersModule } from './sales/orders/orders.module';
@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads/',
      serveStaticOptions: {
        index: false,
        redirect: false,
      },
    }),
    ScheduleModule.forRoot(),
    CompanyModule,
    BranchModule,
    PrismaModule,
    RoleModule,
    ClientModule,
    HumanResourceModule,
    AuthModule,
    InventoryModule,
    BranchExpenseModule,
    PosModule,
    ReportsModule,
    FinanceModule,
    AppOrdersModule,
  ],
})
export class AppModule {}
