import { Post, Get, Controller } from '@nestjs/common';
import { AppOrdersService } from './orders.service';
import { CreateSaleDto } from 'src/dto/pos.dto';

@Controller('api/orders')
export class AppOrdersController {
  constructor(private readonly appOrderService: AppOrdersService) {}

  @Post('place-order')
  placeAppOrder(createSaleDto: CreateSaleDto) {
    
    console.log('Place app order');
  }

  @Get('app-pending-orders')
  getAppPendingOrders() {
    return this.appOrderService.appPendingOrders();
  }

  @Get('app-order-history')
  getAppOrderHistory() {
    return this.appOrderService.appOrderHistory();
  }
}
