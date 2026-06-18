import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { DeliveryAgentService } from './deliveryAgents.service';
import { DeliveryAgentDto } from 'src/dto/deliveryAgent.dto';

@Controller('api/dagent')
export class DeliveryAgentController {
  constructor(private readonly deliveryAgentService: DeliveryAgentService) {}

  @Post('create')
  create(@Body() data: DeliveryAgentDto) {
    return this.deliveryAgentService.create(data);
  }

  @Get('fetch-all')
  findAll() {
    return this.deliveryAgentService.findAll();
  }

  @Get('fetch/:id')
  findOne(@Param('id') id: string) {
    return this.deliveryAgentService.findOne(id);
  }

  @Patch('modify/:id')
  update(@Param('id') id: string, @Body() data: DeliveryAgentDto) {
    return this.deliveryAgentService.update(id, data);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.deliveryAgentService.remove(id);
  }
}
