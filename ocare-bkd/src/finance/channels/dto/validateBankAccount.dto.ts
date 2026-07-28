import { IsString } from 'class-validator';

export class ValidateBankAccountDto {
  @IsString()
  bankName!: string;

  @IsString()
  accountNumber!: string;
}
