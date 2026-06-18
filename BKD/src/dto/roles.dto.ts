import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsNotEmpty, IsJSON } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsJSON()
  permissions: any;
}

export class UpdateRoleDto extends PartialType(CreateRoleDto) {}
