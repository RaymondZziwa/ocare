import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsOptional,
  IsIn,
  MinLength,
} from 'class-validator';

export class WebRegisterDto {
  @IsNotEmpty()
  @IsString()
  fullName!: string;

  @IsNotEmpty()
  @IsString()
  provider!: 'Web' | 'Google' | 'Mobile' | 'In_Shop';

  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsIn(['Male', 'Female'])
  gender?: 'Male' | 'Female';

  @IsNotEmpty()
  @MinLength(6)
  password!: string;
}

export class WebLoginDto {
  email!: string;
  password!: string;
}

export class forgotPasswordDto {
  email!: string;
}

export class passwordResetDto {
  newPassword!: string;
}

export class emailUpdateDto {
  id!: string;
  newEmail!: string;
}

export class updateProfileDto {
  id!: string;
  fullName!: string;
  phone!: string;
  gender!: 'Male' | 'Female';
}

export class CreateAddressDto {
  clientId: string;

  @IsNotEmpty()
  @IsString()
  label!: string;

  @IsNotEmpty()
  @IsString()
  town!: string;

  @IsNotEmpty()
  @IsString()
  village!: string;

  @IsOptional()
  @IsString()
  landmark?: string;
}
