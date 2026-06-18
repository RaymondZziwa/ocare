import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { RoleService } from './roles.service';
import { CreateRoleDto, UpdateRoleDto } from 'src/dto/roles.dto';

@Controller('api/roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post('create')
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @Get('fetch-all')
  findAll() {
    return this.roleService.findAll();
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.roleService.findOne(id);
  // }

  @Patch('modify/:id')
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.roleService.update(id, updateRoleDto);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.roleService.remove(id);
  }

  @Get('permissions')
  findAllPermissions() {
    return this.roleService.getAllPermissions();
  }
}
