// src/payroll/dto/create-payroll-period.dto.ts
export class CreatePayrollPeriodDto {
  periodStart: Date;
  periodEnd: Date;
  payDate: Date;
  totalSpent: number;
  fineSettings: FineSettingsDto;
  companyId: number;
  dateRange: DateRangeDto;
  paymentStructure: PaymentStructureDto[];
  metadata: PayrollMetadataDto;
}

export class FineSettingsDto {
  finePerMissedHour: number;
  totalFinesAmount: number;
}

export class DateRangeDto {
  startDate: string;
  endDate: string;
}

export class PaymentStructureDto {
  employeeId: number;
  name: string;
  branch: string;
  department: string;
  role: string;
  baseSalary: number;
  grossPay: number;
  netPay: number;
  attendance: EmployeeAttendanceDto;
  deductions: EmployeeDeductionsDto;
  allowances: EmployeeAllowancesDto;
  summary: CalculationSummaryDto;
}

export class EmployeeAttendanceDto {
  totalDays: number;
  totalExpectedHours: number;
  totalWorkedHours: number;
  totalMissedHours: number;
  attendanceRate: string;
}

export class EmployeeDeductionsDto {
  missedHoursFine: number;
  generalDeductions: DeductionAllowanceItemDto[];
  employeeDeductions: DeductionAllowanceItemDto[];
}

export class EmployeeAllowancesDto {
  generalAllowances: DeductionAllowanceItemDto[];
  employeeAllowances: DeductionAllowanceItemDto[];
}

export class DeductionAllowanceItemDto {
  name: string;
  amount: number;
}

export class CalculationSummaryDto {
  totalDeductions: number;
  totalAllowances: number;
}

export class PayrollMetadataDto {
  totalEmployees: number;
  periodWorkHours: number;
  generatedAt: string;
  generalDeductions: GeneralDeductionAllowanceDto[];
  generalAllowances: GeneralDeductionAllowanceDto[];
}

export class GeneralDeductionAllowanceDto {
  name: string;
  value: string;
}