import { PartialType } from '@nestjs/mapped-types';
import {
  IsUUID,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsString,
  IsEnum,
  IsArray,
  ValidateNested,
} from 'class-validator';

export class ManufacturingItemDto {
  @IsUUID()
  @IsNotEmpty()
  itemId: number;

  @IsString()
  @IsNotEmpty()
  itemName: string;

  @IsNumber()
  @IsNotEmpty()
  quantity: number; // Quantity in primary unit (L or KG)
}

export class CreateManufacturingDto {
  @IsUUID()
  @IsNotEmpty()
  storeId: number;

  @IsNumber()
  @IsNotEmpty()
  primaryUnitId: number; // Unit ID for primary unit (L or KG)

  @IsNumber()
  @IsNotEmpty()
  unitId: number; // Unit ID for packing unit

  @IsNumber()
  @IsNotEmpty()
  totalQuantity: number; // Total quantity in primary unit

  @IsNumber()
  @IsNotEmpty()
  estimatedOutput: number; // Estimated number of output units/pieces

  @IsArray()
  @ValidateNested({ each: true })
  @IsNotEmpty()
  items: ManufacturingItemDto[]; // Array of manufacturing items

  @IsNumber()
  @IsNotEmpty()
  manufacturedBy: number; // Employee ID

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateManufacturingDto extends PartialType(
  CreateManufacturingDto,
) {
  @IsOptional()
  @IsNumber()
  actualOutput?: number; // Actual output (filled after packing)
}

export class CompleteManufacturingDto {
  @IsNumber()
  @IsNotEmpty()
  actualOutput: number; // Actual output (filled after packing)
}
