import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsArray,
  IsOptional,
  IsEnum,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';

export enum PaymentStatus {
  FULLY_PAID = 'FULLY_PAID',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  UNPAID = 'UNPAID',
}

export class PaymentMethodDto {
  @IsString()
  @IsNotEmpty()
  type: string;

  @IsNumber()
  @Min(0)
  amount: number;
}

export class ItemCategoryDto {
  @IsNotEmpty()
  id: string;

  @IsString()
  name: string;
}

export class SaleItemDto {
  @IsNotEmpty()
  id: string;

  @IsNotEmpty()
  categoryId: string;

  @IsString()
  name: string;

  @IsString()
  price: string; // if numeric in DB, change to @IsNumber()

  @IsString()
  barcode: string;

  @ValidateNested()
  @Type(() => ItemCategoryDto)
  category: ItemCategoryDto;

  @IsNumber()
  quantity: number;

  @IsNumber()
  discount: number;

  @IsNumber()
  total: number;
}

export class CreateSaleDto {
  @IsEnum(PaymentStatus)
  status: PaymentStatus;

  source!: 'Web' | 'Mobile' | 'In_shop';

  @IsString()
  paymentMethod: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsNumber()
  total: number;

  @IsNumber()
  balance: number;

  @IsNumber()
  totalWithDelivery: number;

  @IsArray()
  @ValidateNested({ each: true })
  items: {
    id: string;
    categoryId: string;
    name: string;
    price: string;
    barcode: string;
    category: any;
    quantity: number;
    discount: number;
    total: number;
    unitId: string;
  }[];

  @IsNotEmpty()
  storeId: string;

  @IsNotEmpty()
  customerId: string;

  @IsNotEmpty()
  servedBy: string;

  @IsString()
  @IsOptional()
  phoneNumber: string;
}

export class ExhibitionCreateSaleDto {
  @IsEnum(PaymentStatus)
  status: PaymentStatus;

  @IsArray()
  @ValidateNested({ each: true })
  paymentMethods: [];

  @IsOptional()
  @IsString()
  notes?: string;

  @IsNumber()
  total: number;

  @IsNumber()
  balance: number;

  @IsArray()
  @ValidateNested({ each: true })
  items: any[];

  @IsString()
  @IsNotEmpty()
  storeId: number;

  @IsString()
  @IsNotEmpty()
  customerId: number;

  @IsNotEmpty()
  servedBy: string;
}

export class CollectCreditPaymentDto {
  @IsNumber()
  @IsNotEmpty()
  saleId: string;

  paymentMethods: string;

  @IsNotEmpty()
  servedBy: string;
  referenceId?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsNumber()
  amountPaid: number;

  @IsNumber()
  newBalance: number;
}
export class UpdateExhibitionSaleDto extends PartialType(CreateSaleDto) {}

export class UpdateSaleDto extends PartialType(CreateSaleDto) {}
