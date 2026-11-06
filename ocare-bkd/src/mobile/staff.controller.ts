import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from 'src/guards/authGuard.guard';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrescriptionsService } from './prescriptions.service';
import { ChatService } from './chat.service';
import { OrdersTrackingService, type TrackStatus } from './orders-tracking.service';
import { RefundsService, type RefundDestination } from './refunds.service';

type StaffReq = { user: { id: string } };

/** Pharmacy Desk endpoints for the staff Portal (employee login required). */
@Controller('api/staff')
@UseGuards(JwtAuthGuard)
export class StaffDeskController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly prescriptions: PrescriptionsService,
    private readonly chat: ChatService,
    private readonly orders: OrdersTrackingService,
    private readonly refunds: RefundsService,
  ) {}

  @Get('desk/summary')
  async summary() {
    const [pendingPrescriptions, unreadChats, activeOrders] = await Promise.all([
      this.prisma.prescription.count({ where: { status: 'PENDING' } }),
      this.prisma.chatThread.count({ where: { staffUnread: { gt: 0 } } }),
      this.prisma.sale.count({
        where: { type: { in: ['Web', 'Mobile'] }, saleStatus: { in: ['PENDING', 'PACKAGING', 'IN_DELIVERY'] } },
      }),
    ]);
    return { status: 200, data: { pendingPrescriptions, unreadChats, activeOrders } };
  }

  // ───── Prescriptions ─────
  @Get('prescriptions')
  listPrescriptions(@Query('status') status?: string) {
    return this.prescriptions.listForStaff(status);
  }

  @Get('prescriptions/:id/images/:index')
  async prescriptionImage(
    @Param('id') id: string,
    @Param('index', ParseIntPipe) index: number,
    @Res() res: Response,
  ) {
    const path = await this.prescriptions.imagePathForStaff(id, index);
    res.setHeader('Cache-Control', 'private, max-age=300');
    return res.sendFile(path);
  }

  @Patch('prescriptions/:id/review')
  review(
    @Req() req: StaffReq,
    @Param('id') id: string,
    @Body() dto: { status: 'APPROVED' | 'REJECTED'; reviewNotes?: string; approvedItemIds?: string[]; validDays?: number },
  ) {
    return this.prescriptions.review(id, req.user.id, dto);
  }

  // ───── Prescription-only products ─────
  @Get('items')
  async items(@Query('search') search?: string) {
    const rows = await this.prisma.item.findMany({
      where: search ? { name: { contains: search } } : {},
      select: { id: true, name: true, requiresPrescription: true, category: { select: { name: true } } },
      orderBy: [{ requiresPrescription: 'desc' }, { name: 'asc' }],
      take: 300,
    });
    return { status: 200, data: rows };
  }

  @Patch('items/:id/prescription')
  async setPrescription(@Param('id') id: string, @Body() dto: { requiresPrescription: boolean }) {
    await this.prisma.item.update({ where: { id }, data: { requiresPrescription: !!dto.requiresPrescription } });
    return { status: 200, message: dto.requiresPrescription ? 'Marked as prescription-only' : 'No prescription needed' };
  }

  // ───── Chats ─────
  @Get('chats')
  threads() {
    return this.chat.staffThreads();
  }

  @Get('chats/:threadId/messages')
  messages(@Param('threadId') threadId: string, @Query('after') after?: string) {
    return this.chat.staffMessages(threadId, after);
  }

  @Post('chats/:threadId/messages')
  reply(@Req() req: StaffReq, @Param('threadId') threadId: string, @Body() dto: { body: string }) {
    return this.chat.staffSend(threadId, req.user.id, dto?.body);
  }

  @Post('chats/:threadId/read')
  @HttpCode(HttpStatus.OK)
  read(@Param('threadId') threadId: string) {
    return this.chat.staffMarkRead(threadId);
  }

  // ───── Order tracking ─────
  @Get('orders')
  orderList(@Query('scope') scope?: 'active' | 'all') {
    return this.orders.listForStaff(scope === 'all' ? 'all' : 'active');
  }

  @Patch('orders/:id/status')
  updateOrder(
    @Req() req: StaffReq,
    @Param('id') id: string,
    @Body()
    dto: { status: TrackStatus; note?: string; riderName?: string; riderPhone?: string; estimatedDeliveryAt?: string },
  ) {
    return this.orders.updateStatus(id, dto, req.user?.id);
  }

  // ───── Refunds ─────
  @Post('orders/:id/refund')
  @HttpCode(HttpStatus.OK)
  refund(
    @Req() req: StaffReq,
    @Param('id') id: string,
    @Body() dto: { amount?: number; destination: RefundDestination; reason: string; phone?: string },
  ) {
    return this.refunds.refund({
      saleId: id,
      amount: dto?.amount != null && dto.amount !== ('' as any) ? Number(dto.amount) : undefined,
      destination: dto?.destination,
      reason: dto?.reason,
      phone: dto?.phone || null,
      requestedBy: 'staff',
      employeeId: req.user?.id,
    });
  }

  @Get('refunds')
  refundList() {
    return this.refunds.listForStaff();
  }
}
