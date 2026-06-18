import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDateString,
  IsArray,
  ValidateNested,
  IsNumber,
  IsEnum,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { ExpenseCategory, InventoryRecordCategory } from '@prisma/client';

interface CartItem {
  id: number;
  name: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export class CreateExhibitionDto {
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsNotEmpty() location: string;
  @IsString() @IsOptional() description?: string;
  @IsDateString() startDate: string;
  @IsDateString() endDate: string;
}

export class CreateExhibitionStoreDto {
  @IsString() @IsNotEmpty() name: string;
  @IsNumber() @IsNotEmpty() exhibitionId: number;
}

export class InventoryOperationDto {
  @IsNumber() @IsNotEmpty() storeId: number;
  @IsNumber() @IsNotEmpty() itemId: number;
  @IsNotEmpty() quantity: string; // we keep string to allow Decimal values; Prisma Decimal will accept string
  @IsString() @IsOptional() reason?: string;
  @IsNumber() @IsNotEmpty() employeeId: number;
  @IsString() @IsOptional() category?: string; // e.g., 'RESTOCK', 'DEPLETION', 'ADJUSTMENT'
}

export class CreateExhibitionSaleDto {
  @IsNumber()
  @IsNotEmpty()
  clientId: number;

  @IsNumber()
  @IsNotEmpty()
  cashierId: number;

  @IsNumber()
  @IsNotEmpty()
  exhibitionId: number;

  @IsArray()
  @ValidateNested({ each: true })
  items: CartItem[];

  @IsNotEmpty()
  saleTotal: string;

  @IsOptional()
  @IsNumber()  storeId?: number;
}

export class FetchExhibitionSalesDto {  exhibitionId?: number;
}

export class CreateExhibitionExpenseDto {
  @IsNotEmpty()
  category: ExpenseCategory;

  @IsNumber()
  @IsNotEmpty()
  exhibitionId: number;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsDateString()
  dateIncurred: string;
}

export class UpdateExhibitionExpenseDto {
  @IsOptional()
  category?: ExpenseCategory;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsDateString()
  dateIncurred?: string;
}

export class CreateExpoStockMovementDto {
  @IsNumber()
  @IsNotEmpty()
  itemId: number;

  @IsNumber()
  @IsNotEmpty()
  storeId: number;

  @IsNumber()
  @IsNotEmpty()
  unitId: number;

  @IsString()
  source: string;

  @IsNumber()
  qty: number;

  @IsEnum(InventoryRecordCategory)
  category: InventoryRecordCategory;

  @IsNumber()
  @IsNotEmpty()
  employeeId: number;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateExhibitionDto extends PartialType(CreateExhibitionDto) {}
export class UpdateExhibitionStoreDto extends PartialType(
  CreateExhibitionStoreDto,
) {}
