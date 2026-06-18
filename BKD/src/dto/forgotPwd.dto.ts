import { IsEmail, IsString } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail()
  email: string;
}

export class VerifyCodeDto {
  @IsEmail()
  email: string;

  @IsString()
  code: string;
}

export class ResetPasswordDto {
  @IsEmail()
  email: string;

  @IsString()
  newPassword: string;
}
