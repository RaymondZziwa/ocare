import {
  IsArray,
  IsEnum,
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
  PESAPAL = 'pesapal',
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

  /** Discount on this line, in UGX */
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;
}

export class CreateSystemSaleDto {
  @IsUUID()
  storeId!: string;

  @IsUUID()
  soldBy!: string;

  @IsOptional()
  @IsUUID()
  customerId?: string;

  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

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
  items!: CreateSaleItemDto[];

  /** Discount on the whole sale, as a percentage (0–100) */
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountPercent?: number;

  /** When the sale happened. YYYY-MM-DD (or ISO date-time). Defaults to now. */
  @IsOptional()
  @IsString()
  saleDate?: string;

  /** Draft this sale was completed from (it gets marked completed) */
  @IsOptional()
  @IsString()
  draftId?: string;
}