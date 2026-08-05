import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { SupplierService } from './supplier.service';
import { CreateSupplierDto, UpdateSupplierDto } from 'src/dto/supplier.dto';

@Controller('api/suppliers')
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @Post('create')
  create(@Body() dto: CreateSupplierDto) {
    return this.supplierService.create(dto);
  }

  @Get('fetch-all')
  findAll() {
    return this.supplierService.findAll();
  }

  @Get('fetch/:id')
  findOne(@Param('id') id: string) {
    return this.supplierService.findOne(id);
  }

  @Put('modify/:id')
  update(@Param('id') id: string, @Body() dto: UpdateSupplierDto) {
    return this.supplierService.update(id, dto);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.supplierService.remove(id);
  }
}
