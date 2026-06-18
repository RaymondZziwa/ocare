import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { MarzPayService } from './marzpay.service';

@Controller('api/payments/marzpay')
export class MarzPayController {
  constructor(private readonly marzPayService: MarzPayService) {}

  @Post('callback')
  @HttpCode(HttpStatus.OK)
  async handleCallback(@Body() callbackData: any) {
    return this.marzPayService.processCallback(callbackData);
  }

  @Post('check-status/:reference')
  async checkTransactionStatus(@Param('reference') reference: string) {
    return this.marzPayService.checkTransactionStatus(reference);
  }
}
