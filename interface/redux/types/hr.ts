import type { IBranch, IRole } from "./systemSettings";

export interface IDepartment {
    id: number;
    name: string;
    branchId: string;
    branch: IBranch;
    createdAt: string;
}

export interface IEmployee {
    id: number;
    firstName: string;
    lastName: string;
    gender: "MALE" | "FEMALE";
    email?: string | null;
    tel: string;
    password: string;
    salary: number;
    hasAccess: boolean;
    hasPrescriptionAccess: boolean;
    isActive: boolean;
    profileImage?: string | null;
    roleId: string;
    role: IRole;
    branchId?: string | null;
    branch: IBranch;
    deptId?: string | null;
    department: IDepartment;
    updatedAt: Date;
    createdAt: Date;
}

export interface IAttendance {
    id: number;
    employeeId: string;
    employee: IEmployee;
    date: string;
    timeIn: string;
    timeOut?: string | null;
    notes?: string | null;
    updatedAt: Date;
    createdAt: Date;
}

export interface IPayrollPeriod {
    id: number;
  startDate: string;
  endDate: string;
    payDate: string;
    payroll: IPayrollDetail;
  createdAt: string;
  updatedAt: string;
}

export interface IPayrollDetail {
    id: number;
  payrollPeriodId: string;
  employeeId: string;
  baseSalary: number;
  bonuses: number;
  deductions: number;
  netPay: number;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    department: string;
  };
}

export interface IPayrollEmployee {
    id: number;
  firstName: string;
  lastName: string;
  branch: string;
  department: string;
  baseSalary: string; // Add this
  deductions: { name: string; value: string }[];
  allowances: { name: string; value: string }[];
  grossPay: string;
  netPay: string;
}