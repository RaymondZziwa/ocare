import { EventPaymentStatus } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class EmailVerificationDto {
  @IsEmail()
  email: string;

  @IsString()
  code: string;
}
