import { Type } from 'class-transformer';
import {
  IsString,
  IsNumber,
  Min,
  IsNotEmpty,
  IsOptional,
  IsIn,
  IsEnum,
  IsObject,
  IsUUID,
} from 'class-validator';
import { SeedlingGrowthStatus } from '@prisma/client';
import { PartialType } from '@nestjs/mapped-types';

export class CreateSeedlingStageDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  stageDays: number;
}

export class UpdateSeedlingStageDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  stageDays?: number;
}

export class QuerySeedlingStageDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  skip?: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  take?: number = 10;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  @IsIn(['name', 'stageDays', 'createdAt', 'updatedAt'])
  orderBy?: string = 'createdAt';

  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  orderDirection?: 'asc' | 'desc' = 'desc';
}

export class CreateSeedlingBatchDto {
  @IsString()
  @IsNotEmpty()
  batchNumber: string;

  @IsString()
  @IsNotEmpty()
  currentStageId: number;

  @IsObject()
  @IsNotEmpty()
  seedlings: any;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  daysSpentInCurrentStage: number;

  @IsEnum(SeedlingGrowthStatus)
  @IsNotEmpty()
  status: SeedlingGrowthStatus;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateSeedlingBatchDto extends PartialType(
  CreateSeedlingBatchDto,
) {}

export class UpdateSeedlingBatchStatusDto {
  @IsEnum(SeedlingGrowthStatus)
  @IsNotEmpty()
  status: SeedlingGrowthStatus;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class QuerySeedlingBatchDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  skip?: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  take?: number = 10;

  @IsOptional()
  @IsString()
  batchNumber?: string;

  @IsOptional()
  @IsString()  currentStageId?: number;

  @IsOptional()
  @IsEnum(SeedlingGrowthStatus)
  status?: SeedlingGrowthStatus;

  @IsOptional()
  @IsString()
  @IsIn([
    'batchNumber',
    'status',
    'createdAt',
    'updatedAt',
    'daysSpentInCurrentStage',
  ])
  orderBy?: string = 'createdAt';

  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  orderDirection?: 'asc' | 'desc' = 'desc';
}

export class CreateSeedlingDeathDto {
  @IsUUID()
  @IsNotEmpty()
  batchId: number;

  @IsUUID()
  @IsNotEmpty()
  stageId: number;

  @IsNotEmpty()
  seedlings: any;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class UpdateSeedlingDeathDto extends PartialType(
  CreateSeedlingDeathDto,
) {}
