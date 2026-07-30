import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateClientDto {
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @IsString()
  @IsOptional()
  phone?: string;

  //dob!: Date;

  @IsString()
  gender!: 'Male' | 'Female';

  @IsString()
  @IsOptional()
  address?: string;
}

export class reviewPrescriptionDto {
  @IsString()
  @IsNotEmpty()
  reviewNotes!: string;
}

export class UpdateClientDto extends PartialType(CreateClientDto) {}
