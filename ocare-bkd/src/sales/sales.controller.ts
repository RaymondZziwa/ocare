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
  Patch,
} from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto } from 'src/dto/pos.dto';
import { CreateDraftSaleDto } from 'src/dto/draftSale.dto';
import { SystemPosService } from './systemPos.service';
import { CreateSystemSaleDto } from 'src/dto/systemSale.dto';

@Controller('api/sales')
export class SalesController {
  constructor(
    private readonly salesService: SalesService,
    private readonly systemPosService: SystemPosService,
  ) {}

  @Post('create')
  @HttpCode(HttpStatus.OK) // matches the service's returned status 200
  async create(@Body() createSaleDto: CreateSaleDto) {
    return this.salesService.create(createSaleDto);
  }

  @Post('system-sale')
  @HttpCode(HttpStatus.OK) // matches the service's returned status 200
  async createSystemSale(@Body() createSaleDto:  CreateSystemSaleDto) {
    return this.systemPosService.saveSale(createSaleDto);
  }

  @Patch('system-sale/:id')
  @HttpCode(HttpStatus.OK)
  async updateSystemSale(@Param('id') id: string, @Body() updateSaleDto: CreateSystemSaleDto) {
    return this.systemPosService.updateSale(id, updateSaleDto);
  }

  @Delete('system-sale/:id')
  @HttpCode(HttpStatus.OK)
  async deleteSystemSale(@Param('id') id: string) {
    return this.systemPosService.deleteSale(id);
  }

  @Get('system-sales')
  async findAllSystemSales() {
    return this.systemPosService.findAll();
  }

  @Get('system-sale/:id')
  async findOneSystemSale(@Param('id') id: string) {
    return this.systemPosService.findOne(id);
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
  async deleteSale(@Param('id') id: string) {
    return this.salesService.remove(id);
  }

  // @Patch(':id')
  // @HttpCode(HttpStatus.OK)
  // async updateSale(@Param('id') id: string, @Body() updateSaleDto: CreateSaleDto) {
  //   return this.salesService.updateSale(id, updateSaleDto);
  // }

}
