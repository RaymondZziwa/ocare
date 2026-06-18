import {
  IsString,
  IsNumber,
  IsOptional,
  IsInt,
  Min,
  IsArray,
  ValidateNested,
  IsDate,
  IsEnum,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';

export class ProjectPaymentDto {
  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  @IsOptional()  exhibitionId?: number;

  @IsString()
  cashierId: number;
}

export class CreateProjectSaleDto {
  @IsString()
  clientId: number;

  @IsString()
  projectId: number;

  @IsNumber()
  @Min(0)
  saleTotal: number;

  @IsNumber()
  @Min(0)
  downPayment: number;

  exhibitionId: number;

  @IsInt()
  @Min(1)
  numberOfInstallments: number;

  @IsNumber()
  @Min(0)
  installmentAmount: number;

  @IsString()
  cashierId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProjectPaymentDto)
  @IsOptional()
  initialPayments?: ProjectPaymentDto[];
}

export class AddPaymentDto {
  @IsString()
  saleId: number;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  @IsOptional()
  exhibitionId: number;

  @IsString()
  cashierId: number;

  paymentMethod: PaymentMethodType;
}

export class UpdatePaymentDto {
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  amount?: number;

  @IsOptional()
  @IsString()
  paymentMethod?: PaymentMethodType;

  @IsOptional()
  @IsOptional()
  @IsString()
  referenceId?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()  cashierId?: number;
}

export enum PaymentMethodType {
  CASH = 'CASH',
  MTN_MOMO = 'MTN_MOMO',
  AIRTEL_MOMO = 'AIRTEL_MOMO',
  CARD = 'CARD',
  PROF_MOMO = 'PROF_MOMO',
}

export class CreatePaymentDto {
  @IsString()
  saleId: number;

  @IsNumber()
  amount: number;

  @IsEnum(PaymentMethodType)
  paymentMethod: PaymentMethodType;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsString()
  exhibitionId: number;

  @IsString()
  cashierId: number;
}

export class PaymentResponseDto {
  id: number;
  saleId: number;
  amount: number;
  paymentMethod: PaymentMethodType;
  referenceNumber: string | null;
  notes: string | null;
  paymentDate: Date;
  exhibitionId: number;
  cashierId: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  projectSale?: {
    id: number;
    saleTotal: number;
    client?: {
      firstName: string;
      lastName: string;
    };
    project?: {
      name: string;
    };
  };

  employee?: {
    firstName: string;
    lastName: string;
  };
}

export class UpdateProjectSaleDto extends PartialType(CreateProjectSaleDto) {}
