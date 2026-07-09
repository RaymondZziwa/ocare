import { Post, Get, Controller, Param, Body } from '@nestjs/common';
import { AppOrdersService } from './orders.service';
import { CreateSaleDto } from 'src/dto/pos.dto';

@Controller('api/orders')
export class AppOrdersController {
  constructor(private readonly appOrderService: AppOrdersService) {}

  @Post('place-order')
  async placeAppOrder(@Body() createSaleDto: CreateSaleDto) {
    return this.appOrderService.placeAppOrder(createSaleDto);
  }

  @Get('app-pending-orders')
  getAppPendingOrders() {
    return this.appOrderService.appPendingOrders();
  }

  @Get('app-order-history')
  getAppOrderHistory() {
    return this.appOrderService.appOrderHistory();
  }

  @Get('payment-status/:transactionId')
  async getPaymentStatus(@Param('transactionId') transactionId: string) {
    return this.appOrderService.getPaymentStatus(transactionId);
  }

  @Get('user-orders/:userId')
  async getUserAppOrders(@Param('userId') userId: string) {
    return this.appOrderService.getAppUserOrders(userId);
  }
}
