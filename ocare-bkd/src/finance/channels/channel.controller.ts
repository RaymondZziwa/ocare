import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ChannelService } from './channel.service';
import { CreateChannelDto, UpdateChannelDto } from './dto';

@Controller('api/channels')
export class ChannelController {
  constructor(private readonly channelService: ChannelService) {}

  @Post('create')
  create(@Body() createChannelDto: CreateChannelDto) {
    return this.channelService.create(createChannelDto);
  }

  @Get('all')
  findAll() {
    return this.channelService.findAll();
  }

  @Patch('modify/:id')
  update(@Param('id') id: string, @Body() updateChannelDto: UpdateChannelDto) {
    return this.channelService.update(id, updateChannelDto);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.channelService.remove(id);
  }

  //validate bank account details
  @Get('bank-account/validation/:id')
  validateBankAccount(@Param('id') id: string) {
    return this.channelService.validateBankAccountDetails(id);
  }

  //get supported banks
  @Get('supported-banks')
  getSupportedBanks() {
    return this.channelService.getSupportedBanks();
  }

  //send mobile verification code
  @Get(':id/mobile-money/send-code')
  sendMobileMoneyVerificationCode(@Param('id') id: string) {
    return this.channelService.sendMobileMoneyVerificationCode(id);
  }

  //verify mobile money code
  @Post(':id/mobile-money/verify')
  verifyMobileMoneyCode(@Param('id') id: string, @Body('code') code: string) {
    return this.channelService.validateMobileMoneyVerificationCode(id, code);
  }
}
