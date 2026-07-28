import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { ItemCategoryService } from './itemCateogries.service';

@Controller('api/item-categories')
export class ItemCategoryController {
  constructor(private readonly itemCategoryService: ItemCategoryService) {}

  @Post('create')
  create(@Body() data: { name: string; code: string; description?: string }) {
    return this.itemCategoryService.create(data);
  }

  @Get('fetch-all')
  findAll() {
    return this.itemCategoryService.findAll();
  }

  @Get('fetch/:id')
  findOne(@Param('id') id: string) {
    return this.itemCategoryService.findOne(id);
  }

  @Patch('modify/:id')
  update(@Param('id') id: string, @Body() data: { name?: string }) {
    return this.itemCategoryService.update(id, data);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.itemCategoryService.remove(id);
  }
}
