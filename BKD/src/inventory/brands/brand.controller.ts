import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { BrandService } from './brand.service';

@Controller('api/brand')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Post('create')
  create(
    @Body()
    data: {
      name: string;
    },
  ) {
    return this.brandService.create(data);
  }

  @Get('fetch-all')
  findAll() {
    return this.brandService.findAll();
  }

  @Get('fetch/:id')
  findOne(@Param('id') id: string) {
    return this.brandService.findOne(id);
  }

  @Patch('modify/:id')
  update(@Param('id') id: string, @Body() data: { name: string }) {
    return this.brandService.update(id, data);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.brandService.remove(id);
  }
}
