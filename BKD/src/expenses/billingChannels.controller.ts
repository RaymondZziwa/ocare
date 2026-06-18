import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { VerifyMeterNumberDto } from 'src/dto/utility.dto';
import { BillingChannelsService } from './billingChannels.service';

@Controller('api/billing-channels')
export class BillingChannelsController {
  constructor(
    private readonly billingChannelsService: BillingChannelsService,
  ) {}

  @Post('create')
  async create(
    @Body() createDto: { utility: 'LIGHT' | 'NWSC'; meterNumber: string },
  ) {
    return this.billingChannelsService.create(createDto);
  }

  @Get('all')
  async findAll() {
    return this.billingChannelsService.findAll();
  }

  @Get('nwsc-areas')
  async getNwscAreas() {
    return this.billingChannelsService.getNwscAreas();
  }

  @Put('update/:id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: { name?: string; location?: string },
  ) {
    return this.billingChannelsService.update(parseInt(id), updateDto);
  }

  @Delete('delete/:id')
  async remove(@Param('id') id: string) {
    return this.billingChannelsService.remove(parseInt(id));
  }

  @Post('verify')
  async verifyChannel(@Body() verifyDto: VerifyMeterNumberDto) {
    return this.billingChannelsService.verifyChannel(verifyDto);
  }
}
