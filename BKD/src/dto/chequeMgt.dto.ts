import { PartialType } from '@nestjs/mapped-types';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
} from 'class-validator';

export class CreateChequeDto {
  @IsNotEmpty()
  @IsString()
  chequeNumber: string;

  @IsNotEmpty()
  @IsNumber()
  bankId: number;

  @IsNotEmpty()
  @IsString()
  DraweeFirstName: string;

  @IsOptional()
  @IsString()
  DraweeLastName?: string;

  @IsOptional()
  @IsString()
  contact?: string;

  @IsOptional()
  @IsString()
  Address?: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number; // Prisma Decimal -> number in API

  @IsOptional()
  @IsString()
  status: string; // optional: 'PENDING', 'CLEARED', etc.

  @IsNotEmpty()
  @IsDateString()
  bankingDate: string; // ISO string like "2025-09-16T00:00:00.000Z"
}

export class UpdateChequeDto extends PartialType(CreateChequeDto) {}
