import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MarzPayController } from './marzpay.controller';
import { MarzPayService } from './marzpay.service';

@Module({
  imports: [HttpModule],
  controllers: [MarzPayController],
  providers: [MarzPayService],
})
export class MarzPayModule {}
