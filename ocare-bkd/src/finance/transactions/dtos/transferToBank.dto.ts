import {
  IsNumber,
  IsOptional,
  IsString,
  IsNotEmpty,
  Min,
} from 'class-validator';

export class WithdrawToBankDto {
  @IsNotEmpty()
  internalWalletId!: string;

  @IsNumber()
  @Min(1)
  amount!: number;

  @IsString()
  @IsNotEmpty()
  description!: string;

  channelId!: string;

  @IsString()
  @IsNotEmpty()
  bank_name!: string;

  @IsString()
  @IsNotEmpty()
  bank_account_number!: string;

  @IsString()
  @IsNotEmpty()
  bank_account_name!: string;

  @IsString()
  @IsOptional()
  bank_branch?: string;

  @IsString()
  @IsNotEmpty()
  wallet_source!: string;
}
