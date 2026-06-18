import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { DeliveryAreaService } from './areas.service';
import { DeliveryAreaDto } from 'src/dto/deliveryArea.dto';

@Controller('api/darea')
export class DeliveryAreaController {
  constructor(private readonly deliveryAreasService: DeliveryAreaService) {}

  @Post('create')
  create(@Body() data: DeliveryAreaDto) {
    return this.deliveryAreasService.create(data);
  }

  @Get('fetch-all')
  findAll() {
    return this.deliveryAreasService.findAll();
  }

  @Get('fetch/:id')
  findOne(@Param('id') id: string) {
    return this.deliveryAreasService.findOne(id);
  }

  @Patch('modify/:id')
  update(@Param('id') id: string, @Body() data: DeliveryAreaDto) {
    return this.deliveryAreasService.update(id, data);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.deliveryAreasService.remove(id);
  }
}
