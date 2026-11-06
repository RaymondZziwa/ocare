import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import { ClientAuthGuard, type AuthedClient } from './client-auth.guard';
import { prescriptionUploadOptions } from './private-storage';
import { PrescriptionsService } from './prescriptions.service';
import { ChatService } from './chat.service';
import { OrdersTrackingService } from './orders-tracking.service';
import { AccountService } from './account.service';
import { CheckoutService, type CheckoutDto, type PayMethod } from './checkout.service';
import { AppPaymentsService } from './payments.service';
import { ClientWalletService } from './wallet.service';
import type { RefundDestination } from './refunds.service';

type ClientReq = { client: AuthedClient };

/** Endpoints used by the Ocare customer app (web + Android + iOS). */
@Controller('api/app')
@UseGuards(ClientAuthGuard)
export class ClientAppController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly prescriptions: PrescriptionsService,
    private readonly chat: ChatService,
    private readonly orders: OrdersTrackingService,
    private readonly account: AccountService,
    private readonly checkout: CheckoutService,
    private readonly payments: AppPaymentsService,
    private readonly wallet: ClientWalletService,
  ) {}

  // ───── Push notification devices ─────
  @Post('devices')
  async registerDevice(@Req() req: ClientReq, @Body() dto: { token: string; platform: 'ANDROID' | 'IOS' | 'WEB' }) {
    if (!dto?.token || !['ANDROID', 'IOS', 'WEB'].includes(dto.platform)) return { status: 400 };
    await this.prisma.deviceToken.upsert({
      where: { token: dto.token },
      create: { token: dto.token, platform: dto.platform, clientId: req.client.id },
      update: { platform: dto.platform, clientId: req.client.id },
    });
    return { status: 200 };
  }

  @Post('devices/remove')
  @HttpCode(HttpStatus.OK)
  async removeDevice(@Req() req: ClientReq, @Body() dto: { token: string }) {
    await this.prisma.deviceToken.deleteMany({ where: { token: dto?.token, clientId: req.client.id } });
    return { status: 200 };
  }

  // ───── Prescriptions ─────
  @Get('prescriptions')
  listPrescriptions(@Req() req: ClientReq) {
    return this.prescriptions.listForClient(req.client.id);
  }

  @Post('prescriptions')
  @UseInterceptors(FilesInterceptor('images', 4, prescriptionUploadOptions))
  uploadPrescription(
    @Req() req: ClientReq,
    @UploadedFiles() files: Express.Multer.File[],
    @Body('notes') notes?: string,
  ) {
    return this.prescriptions.create(req.client.id, files, notes);
  }

  @Get('prescriptions/:id/images/:index')
  async prescriptionImage(
    @Req() req: ClientReq,
    @Param('id') id: string,
    @Param('index', ParseIntPipe) index: number,
    @Res() res: Response,
  ) {
    const path = await this.prescriptions.imagePathForClient(req.client.id, id, index);
    res.setHeader('Cache-Control', 'private, max-age=300');
    return res.sendFile(path);
  }

  // ───── Chat with a pharmacist ─────
  @Get('chat/messages')
  chatMessages(@Req() req: ClientReq, @Query('after') after?: string) {
    return this.chat.clientMessages(req.client.id, after);
  }

  @Get('chat/unread')
  chatUnread(@Req() req: ClientReq) {
    return this.chat.clientUnread(req.client.id);
  }

  @Post('chat/messages')
  sendChat(@Req() req: ClientReq, @Body() dto: { body: string; orderId?: string }) {
    return this.chat.clientSend(req.client.id, dto?.body, dto?.orderId);
  }

  @Post('chat/read')
  @HttpCode(HttpStatus.OK)
  readChat(@Req() req: ClientReq) {
    return this.chat.clientMarkRead(req.client.id);
  }

  // ───── Orders & tracking ─────
  @Get('orders')
  listOrders(@Req() req: ClientReq) {
    return this.orders.listForClient(req.client.id);
  }

  @Get('orders/:id')
  getOrder(@Req() req: ClientReq, @Param('id') id: string) {
    return this.orders.getForClient(req.client.id, id);
  }

  @Post('orders/:id/cancel')
  @HttpCode(HttpStatus.OK)
  cancelOrder(@Req() req: ClientReq, @Param('id') id: string, @Body() dto: { reason?: string; refundTo?: RefundDestination }) {
    return this.orders.cancelByClient(req.client.id, id, dto?.reason, dto?.refundTo);
  }

  /** Pay for an order that is waiting for payment (retry mobile money, or switch method) */
  @Post('orders/:id/pay')
  @HttpCode(HttpStatus.OK)
  payOrder(@Req() req: ClientReq, @Param('id') id: string, @Body() dto: { method: PayMethod; phone?: string }) {
    return this.checkout.payOrder(req.client.id, id, dto || ({} as any));
  }

  // ───── Checkout ─────
  @Get('checkout/info')
  checkoutInfo(@Req() req: ClientReq) {
    return this.checkout.info(req.client.id);
  }

  @Post('checkout/zone')
  @HttpCode(HttpStatus.OK)
  checkZone(@Body() dto: { latitude?: number; longitude?: number; area?: string }) {
    return this.checkout.checkZone(dto || {});
  }

  @Post('checkout')
  @HttpCode(HttpStatus.OK)
  placeOrder(@Req() req: ClientReq, @Body() dto: CheckoutDto) {
    return this.checkout.placeOrder(req.client.id, dto);
  }

  // ───── Payments & wallet ─────
  @Get('payments/:id')
  payment(@Req() req: ClientReq, @Param('id') id: string) {
    return this.payments.getForClient(req.client.id, id);
  }

  @Get('wallet')
  walletOverview(@Req() req: ClientReq) {
    return this.wallet.overview(req.client.id);
  }

  @Post('wallet/topup')
  @HttpCode(HttpStatus.OK)
  topUp(@Req() req: ClientReq, @Body() dto: { amount: number; phone: string }) {
    return this.payments.startTopUp(req.client.id, Number(dto?.amount), dto?.phone || '');
  }

  // ───── Account ─────
  @Delete('account')
  @HttpCode(HttpStatus.OK)
  deleteAccount(@Req() req: ClientReq, @Body() dto: { password?: string }) {
    return this.account.deleteAccount(req.client.id, dto?.password);
  }
}
