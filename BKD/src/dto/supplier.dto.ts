import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { PaymentType } from '@prisma/client';

export class CreateSupplierDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  contact: string;

  @IsString()
  @IsOptional()
  address?: string;
}

export class SupplierPaymentDto {
  @IsString()
  supplyId: string;

  @IsEnum(PaymentType)
  paymentType: PaymentType;

  @IsString()
  bankName: string;

  @IsNumber()
  amount: number;

  @IsString()
  paidBy: string;

  @IsOptional()
  @IsString()
  barterItemName?: string;

  @IsOptional()
  @IsString()
  chequeNumber?: string;

  @IsOptional()
  @IsDateString()
  chequeBankingDate?: string; // ISO date string
}

export class UpdateSupplierDto extends PartialType(CreateSupplierDto) {}
