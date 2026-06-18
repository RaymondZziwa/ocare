// src/events/dto/create-event.dto.ts
import {
  IsString,
  IsOptional,
  IsDateString,
  IsNumber,
  IsEnum,
  IsNotEmpty,
  IsPositive,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { EventPaymentStatus } from '@prisma/client';

export class CreateEventDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  startDate: Date;

  @IsDateString()
  endDate: Date;

  @IsNumber()
  ticketPrice: number;

  @IsString()
  @IsOptional()
  location?: string;

  @IsNumber()
  @IsOptional()
  capacity?: number;

  walletId: number;
}

export class UpdateEventDto extends PartialType(CreateEventDto) {}

export class CreateEventParticipantDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  tel: string;

  @IsString()
  @IsOptional()
  tel2?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsNumber()
  @IsPositive()
  amountPaid: number;

  @IsEnum(EventPaymentStatus)
  @IsOptional()
  paymentStatus?: EventPaymentStatus;

  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @IsString()
  @IsNotEmpty()
  eventId: number;
}

export class UpdateParticipantDto extends PartialType(
  CreateEventParticipantDto,
) {}

export class UpdatePaymentStatusDto {
  participantId: number;
  eventId: number;
}

export class CompleteTicketPaymentDto {
  @IsNumber()
  @IsPositive()
  amountPaid: number;

  @IsString()
  @IsOptional()
  paymentMethod?: string;
}
