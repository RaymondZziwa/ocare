import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateSupplierDto {
  @IsString()
  businessName!: string;

  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsString()
  @IsNotEmpty()
  contact!: string;

  @IsString()
  @IsOptional()
  address?: string;

  type!: 'INDIVIDUAL' | 'BUSINESS';
}

export class UpdateSupplierDto extends PartialType(CreateSupplierDto) {}
