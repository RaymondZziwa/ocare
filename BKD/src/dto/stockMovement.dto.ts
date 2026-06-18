// dto/create-stock-movement.dto.ts
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
} from 'class-validator';
import { InventoryRecordCategory } from '@prisma/client';

export class CreateStockMovementDto {
  @IsNotEmpty()
  itemId: string;

  @IsNotEmpty()
  storeId: string;

  @IsOptional()
  toStoreId: string;

  @IsNotEmpty()
  unitId: string;

  @IsString()
  source: string;

  @IsString()
  qty: string;

  @IsEnum(InventoryRecordCategory)
  category: InventoryRecordCategory;

  @IsNotEmpty()
  employeeId: string; // ✅ who made the transaction

  @IsNumber()
  @IsNotEmpty()
  deliveryNoteId: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class ConfirmStockMovementDto {
  transferId: string;
  confirmedQty: number;
  notes: string;
}

export class RejectStockMovementDto {
  transferId: string;
  reason: string;
}

export class CreateDeliveryNoteDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  deliveryNoteNumber: string;

  @IsOptional()
  registeredBy: string;

  @IsOptional()
  @IsString()
  notes: string;
}
