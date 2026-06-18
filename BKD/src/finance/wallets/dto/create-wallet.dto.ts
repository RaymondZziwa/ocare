import { IsString, IsOptional } from 'class-validator';

export class CreateWalletDto {
  channelId: number;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  purpose?: string;
}
