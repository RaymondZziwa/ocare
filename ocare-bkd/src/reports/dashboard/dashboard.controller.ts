import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('api/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('metrics')
  async getMetrics() {
    return this.dashboardService.getDashboardMetrics();
  }

  @Get('employee-metrics')
  async getEmployeeMetrics(
    @Query('storeId') storeId?: string,
    @Query('branchId') branchId?: string,
    @Query('salesDays') salesDays?: number,
    @Query('expenseDays') expenseDays?: number,
  ) {
    return this.dashboardService.getEmployeeDashboardMetrics({
      storeId: storeId ? storeId : undefined,
      salesDays: salesDays ? salesDays : undefined,
      expenseDays: expenseDays ? expenseDays : undefined,
    });
  }
}
