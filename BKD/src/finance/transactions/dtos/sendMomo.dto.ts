// mobile-money-payment.dto.ts
import {
  IsString,
  IsNumber,
  IsOptional,
  IsUUID,
  MaxLength,
  Min,
  Max,
  Matches,
  IsIn,
} from 'class-validator';

export class MobileMoneyPaymentDto {
  @IsNumber()
  @Min(500, { message: 'Amount must be at least UGX 500' })
  @Max(10000000, { message: 'Amount cannot exceed UGX 10,000,000' })
  amount!: number;

  @IsString()
  @Matches(/^\+256[0-9]{9}$/, {
    message:
      'Phone number must be in format +256xxxxxxxxx (e.g., +256701234567)',
  })
  phone_number!: string;

  @IsString()
  @IsIn(['UG'], { message: 'Country code must be UG' })
  country!: string;

  @IsUUID('all', { message: 'Reference must be a valid UUID' })
  reference!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'Description cannot exceed 255 characters' })
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'Callback URL cannot exceed 255 characters' })
  @Matches(/^https?:\/\/[^\s]+$/, {
    message: 'Callback URL must be a valid HTTP/HTTPS URL',
  })
  callback_url?: string;
}
