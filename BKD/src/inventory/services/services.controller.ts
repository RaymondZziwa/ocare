import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { MservicesService } from './services.service';

@Controller('api/services')
export class ServicesController {
  constructor(private readonly mServicesService: MservicesService) {}

  @Post('create')
  create(@Body() data: { name: string; price: number }) {
    return this.mServicesService.create(data);
  }

  @Get('fetch-all')
  findAll() {
    return this.mServicesService.findAll();
  }

  @Get('fetch/:id')
  findOne(@Param('id') id: string) {
    return this.mServicesService.findOne(Number(id));
  }

  @Patch('modify/:id')
  update(
    @Param('id') id: string,
    @Body() data: { name?: string; price?: number },
  ) {
    return this.mServicesService.update(Number(id), data);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.mServicesService.remove(Number(id));
  }
}
