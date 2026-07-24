import {
  IsString,
  IsOptional,
  IsArray,
  IsInt,
  IsUUID,
  Min,
  Max,
  IsNotEmpty,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateProfileDto {
  @IsUUID()
  userId: number;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  interests?: string[];

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  profession?: string; // matches your Prisma model

  @IsOptional()
  @IsString()
  education?: string;

  @IsOptional()
  @IsString()
  goals?: string;

  @IsOptional()
  @IsInt()
  @Min(18)
  minAge: number;

  @IsOptional()
  @IsInt()
  @Min(18)
  @Max(100)
  maxAge: number;

  @IsArray()
  @IsString({ each: true })
  interestedIn: string[];

  @IsOptional()
  @IsString()
  genderPreference?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  distance?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  lookingFor?: string[];
}

export class updatePwdDto {
  @IsUUID()
  userId: number;
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class UpdateProfileDto extends PartialType(CreateProfileDto) {}
