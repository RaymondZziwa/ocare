// src/bank/dto/create-bank.dto.ts
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumberString,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateBankDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsNumberString()
  accountNumber?: string;

  @IsOptional()
  balance?: number;
}

export class UpdateBankDto extends PartialType(CreateBankDto) {}
