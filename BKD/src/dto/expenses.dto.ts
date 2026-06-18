import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { ExpenseCategory } from '@prisma/client';

export class CreateBranchExpenseDto {
  @IsNotEmpty()
  branchId: string;

  @IsEnum(ExpenseCategory)
  category: ExpenseCategory;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  amount: number;

  @IsDateString()
  dateIncurred: string; // ISO string

  @IsNotEmpty()
  recordedBy: string; // Employee ID
}

export class UpdateBranchExpenseDto {
  @IsEnum(ExpenseCategory)
  @IsOptional()
  category?: ExpenseCategory;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsDateString()
  @IsOptional()
  dateIncurred?: string;
}
