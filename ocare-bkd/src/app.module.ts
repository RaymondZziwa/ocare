import { Module } from '@nestjs/common';
import { WebAppModule } from './web-app/webApp.module';
import { ConfigModule } from '@nestjs/config';
import { FinanceModule } from './finance/finance.module';
import { CompanyModule } from './company-profile/profile.module';
import { InventoryModule } from './inventory/inventory.module';
import { AuthModule } from './auth/auth.module';
import { BranchModule } from './branches/branch.module';
import { HumanResourceModule } from './humanResource/humanResource.module';
import { BranchExpenseModule } from './expenses/expenses.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { SalesModule } from './sales/sales.module';
import { ReportsModule } from './reports/reports.module';
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
    ConfigModule.forRoot({
      isGlobal: true, // Makes ConfigService available everywhere without re-importing
    }),
    AuthModule,
    WebAppModule,
    FinanceModule,
    CompanyModule,
    InventoryModule,
    BranchModule,
    HumanResourceModule,
    BranchExpenseModule,
    SalesModule,
    ReportsModule,
  ],
})
export class AppModule {}
