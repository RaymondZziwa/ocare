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
  itemId!: string;

  @IsNotEmpty()
  storeId!: string;

  @IsOptional()
  toStoreId!: string;

  @IsNotEmpty()
  unitId!: string;

  @IsString()
  source!: string;

  @IsString()
  qty!: string;

  @IsEnum(InventoryRecordCategory)
  category!: InventoryRecordCategory;

  @IsNotEmpty()
  employeeId!: string; // ✅ who made the transaction

  @IsNumber()
  @IsNotEmpty()
  deliveryNoteId!: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class ConfirmStockMovementDto {
  transferId!: string;
  confirmedQty!: number;
  notes!: string;
}

export class RejectStockMovementDto {
  transferId!: string;
  reason!: string;
}
export class ReceivePurchaseDto {
  supplierId!: string;
  storeId!: string;
  receivedBy!: string;
  invoiceNumber!: string;
  invoiceDate!: Date;
  deliveryNoteNumber?: string;
  notes?: string;

  items!: {
    itemId: string;
    unitId: string;
    quantity: number;

    batch: {
      number: string;
      expiryDate: Date;
      brandId: string;
      buyingPrice: number;
      sellingPrice: number;
      wholesalePrice?: number;
    };
  }[];
}

export class AdjustStockDto {
  storeId!: string;
  adjustedBy!: string;
  notes?: string;

  items!: {
    itemId: string;
    quantity: number;

    batch: {
      number: string;
    };
  }[];
}
