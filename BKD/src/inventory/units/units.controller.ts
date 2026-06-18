import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { MeasurementUnitService } from './units.service';

@Controller('api/units')
export class MeasurementUnitController {
  constructor(private readonly measurementService: MeasurementUnitService) {}

  @Post('create')
  create(@Body() data: { name: string; abr: string }) {
    return this.measurementService.create(data);
  }

  @Get('fetch-all')
  findAll() {
    return this.measurementService.findAll();
  }

  @Get('fetch/:id')
  findOne(@Param('id') id: string) {
    return this.measurementService.findOne(id);
  }

  @Patch('modify/:id')
  update(@Param('id') id: string, @Body() data: { name?: string }) {
    return this.measurementService.update(id, data);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.measurementService.remove(id);
  }
}
