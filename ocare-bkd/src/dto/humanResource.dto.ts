import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsUUID,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateDepartmentDto {
  @IsNotEmpty()
  @IsString()
  name: string;


}

export class CreateEmployeeDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsString()
  gender: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  tel: string;

  @IsNotEmpty()
  @IsString()
  password: string;


  @IsOptional()
  @IsBoolean()
  hasAccess?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  profileImage?: string;

  branchId!: string;
}

export class employeeProfileUpdateDto {
  @IsEmail()
  email: string;

  @IsString()
  tel: string;

  @IsString()
  password: string;
}

export class saveEmployeeSystemSettingsDto {
  @IsBoolean()
  twoFactorAuth: boolean;

  @IsString()
  systemEmails: string;
}

export class UpdateDepartmentDto extends PartialType(CreateDepartmentDto) {}
export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto) {}
