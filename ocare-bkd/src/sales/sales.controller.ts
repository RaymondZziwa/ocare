import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto } from 'src/dto/pos.dto';
import { CreateDraftSaleDto } from 'src/dto/draftSale.dto';

@Controller('api/sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post('create')
  @HttpCode(HttpStatus.OK) // matches the service's returned status 200
  async create(@Body() createSaleDto: CreateSaleDto) {
    return this.salesService.create(createSaleDto);
  }

  @Post('save-draft')
  async saveDraft(@Body() dto: CreateDraftSaleDto) {
    return this.salesService.saveDraft(dto);
  }

  @Get()
  async findAll() {
    return this.salesService.findAll();
  }

  @Get('all-draft-sales')
  async findAllDraftSales() {
    return this.salesService.getAllDraftSales();
  }

  @Post('generate-quotation')
  async getQuotation(@Body() dto: { email: string; draftId: string }) {
    return this.salesService.getQuotation(dto.email, dto.draftId);
  }

  @Post('delete-draft')
  async deleteDraft(@Body() dto: { draftId: string }) {
    return this.salesService.deleteDraft(dto.draftId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.salesService.findOne(id);
  }

  @Get(':id/purchases')
  async findUserPurchases(@Param('id') id: string) {
    return this.salesService.getAllUserPurchases(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    return this.salesService.remove(id);
  }
}

