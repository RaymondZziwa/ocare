// createDraftSale.dto.ts

import { IsString, IsOptional, IsNumber, IsArray } from 'class-validator';

export class CreateDraftSaleDto {
  @IsString()
  id!: string;

  @IsString()
  storeId!: string;

  @IsString()
  servedBy!: string;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsArray()
  cart!: any[];

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsNumber()
  amountPaid?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  paymentStatus?: string;
}
