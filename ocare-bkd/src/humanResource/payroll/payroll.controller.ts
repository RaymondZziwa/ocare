// import {
//   Controller,
//   Get,
//   Post,
//   Body,
//   Param,
//   Query,
//   Put,
//   BadRequestException,
//   NotFoundException,
// } from '@nestjs/common';
// import { PayrollService } from './payroll.service';
// import {
//   CreateAttendanceDto,
//   UpdateAttendanceDto,
// } from 'src/dto/attendance.dto';
// import {
//   CreatePayrollPeriodDto,
//   PaymentStructureDto,
// } from 'src/dto/payroll.dto';

// @Controller('api/employees')
// export class PayrollController {
//   constructor(private readonly payrollService: PayrollService) {}

//   @Post('record-attendance')
//   recordAttendance(@Body() dto: CreateAttendanceDto) {
//     return this.payrollService.createAttendance(dto);
//   }

//   @Put('modify-attendance/:id')
//   modifyAttendance(@Param('id') id: string, @Body() dto: UpdateAttendanceDto) {
//     return this.payrollService.updateAttendance(Number(id), dto);
//   }

//   @Get('attendance/daily-sheet')
//   async getDailyAttendanceSheet(@Query('date') date?: string) {
//     return await this.payrollService.getDailyAttendanceSheet(date);
//   }

//   @Get('summary')
//   async getAttendanceSummaryByPeriod(
//     @Query('companyId') companyId: number,
//     @Query('startDate') startDate: string,
//     @Query('endDate') endDate: string,
//   ) {
//     // Basic validation
//     if (!startDate || !endDate) {
//       throw new BadRequestException(
//         'companyId, startDate, and endDate are required query parameters.',
//       );
//     }

//     // Validate date format
//     const start = new Date(startDate);
//     const end = new Date(endDate);
//     if (isNaN(start.getTime()) || isNaN(end.getTime())) {
//       throw new BadRequestException('Invalid date format.');
//     }

//     return await this.payrollService.getAttendanceSummaryByPeriod(
//       startDate,
//       endDate,
//     );
//   }

//   @Post('save-payroll')
//   async createPayrollPeriod(@Body() dto: CreatePayrollPeriodDto) {
//     return this.payrollService.createPayrollPeriod(dto);
//   }

//   /** GET all payroll periods (history) */
//   @Get('payroll-history')
//   async getPayrollHistory() {
//     return this.payrollService.listPayrollPeriods();
//   }

//   /** GET a single payroll period by ID */
//   @Get('period/:id')
//   async getPayrollPeriod(@Param('id') id: string) {
//     const payrollPeriod = await this.payrollService.getPayrollPeriod(Number(id));
//     if (!payrollPeriod) throw new NotFoundException('Payroll period not found');
//     return payrollPeriod;
//   }

//   /** UPDATE payroll period */
//   @Put('period/:id')
//   async updatePayrollPeriod(
//     @Param('id') id: string,
//     @Body() dto: CreatePayrollPeriodDto,
//   ) {
//     return this.payrollService.updatePayrollPeriod(Number(id), dto);
//   }

//   /** UPSERT payrolls for a payroll period */
//   @Put('period/:id/payrolls')
//   async upsertPayrolls(
//     @Param('id') payrollPeriodId: number,
//     @Body() payrolls: PaymentStructureDto[],
//   ) {
//     return this.payrollService.upsertPayrolls(payrollPeriodId, payrolls);
//   }
// }
