import { IsOptional, IsString } from 'class-validator';

export class VerifyMeterNumberDto {
  channelId!: number;

  @IsString()
  utilityType!: 'LIGHT' | 'NWSC';

  @IsString()
  meterNumber!: string;

  @IsString()
  @IsOptional()
  area?: string;
}
