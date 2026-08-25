import { Controller, Get, Patch, Delete, Body, Param } from '@nestjs/common';
import { BatchService } from './batch.service';

@Controller('api/batch')
export class BatchController {
  constructor(private readonly batchService: BatchService) {}
  @Get('fetch-all')
  findAll() {
    return this.batchService.findAll();
  }

  @Get('fetch/:id')
  findOne(@Param('id') id: string) {
    return this.batchService.findOne(id);
  }

  @Patch('modify/:id')
  update(
    @Param('id') id: string,
    @Body()
    data: {
      number: string;
      buyingPrice: number;
      sellingPrice: number;
      wholesalePrice: number;
      expiryDate: Date;
      itemId: string;
      brandId: string;
    },
  ) {
    return this.batchService.update(id, data);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.batchService.remove(id);
  }
}
