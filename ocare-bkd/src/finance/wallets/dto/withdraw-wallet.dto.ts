import { IsNumber, Min } from 'class-validator';

export class WithdrawWalletDto {
  @IsNumber()
  @Min(0.01)
  amount: number;
}
