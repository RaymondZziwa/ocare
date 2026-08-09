import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsNumber,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum PaymentMethod {
  CASH = 'cash',
  MTN = 'mtn',
  AIRTEL = 'airtel',
  VISA = 'visa',
}

export enum SaleType {
  RETAIL = 'retail',
  WHOLESALE = 'wholesale',
}

export class CreateSaleItemDto {
  @IsUUID()
  itemId: string;

  @IsUUID()
  batchId: string;

  @IsUUID()
  unitId: string;

  @IsEnum(SaleType)
  saleType: SaleType;

  @IsNumber()
  @Min(0.000001)
  quantity: number;
}

export class CreateSystemSaleDto {
  @IsUUID()
  storeId: string;

  @IsUUID()
  soldBy: string;

  @IsOptional()
  @IsUUID()
  customerId?: string;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsOptional()
  @IsString()
  notes?: string;

  // Only required for MTN/Airtel
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSaleItemDto)
  items: CreateSaleItemDto[];
}