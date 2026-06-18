import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsArray,
  IsUUID,
} from 'class-validator';

export enum SaleStatus {
  FULLY_PAID = 'FULLY_PAID',
  UNPAID = 'UNPAID',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
}

export enum PaymentMethodType {
  CASH = 'CASH',
  MTN_MOMO = 'MTN_MOMO',
  AIRTEL_MOMO = 'AIRTEL_MOMO',
  CARD = 'CARD',
  PROF_MOMO = 'PROF_MOMO',
}

export interface PaymentMethod {
  method: PaymentMethodType;
  amount: number;  referenceId?: number;
}

export class CreateMassageSaleDto {
  @IsUUID()
  clientId: number;

  @IsUUID()
  serviceId: number;

  @IsNumber()
  total: number;

  @IsEnum(SaleStatus)
  status: SaleStatus;

  @IsNumber()
  balance: number;

  @IsArray()
  paymentMethods: PaymentMethod[];

  @IsOptional()
  @IsString()
  notes?: string;

  @IsNumber()
  servedBy: number;
}

export class CreateMassagePaymentDto {
  @IsUUID()
  saleId: number;

  @IsNumber()
  amount: number;

  @IsEnum(PaymentMethodType)
  paymentMethod: PaymentMethodType;

  @IsOptional()
  @IsString()  referenceId?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsUUID()
  cashierId: number;
}

export class UpdateMassageSaleDto {
  @IsOptional()
  @IsEnum(SaleStatus)
  status?: SaleStatus;

  @IsOptional()
  @IsNumber()
  balance?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class MassageSaleResponseDto {
  id: number;
  clientId: number;
  serviceId: number;
  total: number;
  status: SaleStatus;
  balance: number;
  paymentMethods: PaymentMethod[];
  notes?: string;
  servedBy: string;
  createdAt: Date;
  updatedAt: Date;
  client?: any;
  service?: any;
  employee?: any;
  payments?: any[];
}

export class MassagePaymentResponseDto {
  id: number;
  saleId: number;
  amount: number;
  paymentMethod: PaymentMethodType;  referenceId?: number;
  notes?: string;
  cashierId: number;
  createdAt: Date;
  updatedAt: Date;
  sale?: any;
  employee?: any;
}
