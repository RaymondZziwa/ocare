import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { DepartmentService } from './department.service';
import {
  CreateDepartmentDto,
  UpdateDepartmentDto,
} from 'src/dto/humanResource.dto';

@Controller('api/departments')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Post('create')
  create(@Body() dto: CreateDepartmentDto) {
    return this.departmentService.create(dto);
  }

  @Get('fetch-all')
  findAll() {
    return this.departmentService.findAll();
  }

  @Get('fetch/:id')
  findOne(@Param('id') id: string) {
    return this.departmentService.findOne(id);
  }

  @Patch('modify/:id')
  update(@Param('id') id: string, @Body() dto: UpdateDepartmentDto) {
    return this.departmentService.update(id, dto);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.departmentService.remove(id);
  }
}
