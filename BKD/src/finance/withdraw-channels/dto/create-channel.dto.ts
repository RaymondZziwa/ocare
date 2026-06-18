import { IsString, IsOptional, IsEnum } from 'class-validator';

export enum ChannelType {
  BANK_TRANSFER = 'BANK_TRANSFER',
  MOBILE_MONEY = 'MOBILE_MONEY',
}

export class CreateChannelDto {
  @IsEnum(ChannelType)
  type: ChannelType;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  bank?: string;

  @IsString()
  @IsOptional()
  accountNumber?: string;
}
