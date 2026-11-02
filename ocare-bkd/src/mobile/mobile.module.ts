import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { ClientAuthGuard } from './client-auth.guard';
import { PushService } from './push.service';
import { PrescriptionsService } from './prescriptions.service';
import { ChatService } from './chat.service';
import { OrdersTrackingService } from './orders-tracking.service';
import { AccountService } from './account.service';
import { OrderMailService } from './order-mail.service';
import { ClientAppController } from './client.controller';
import { StaffDeskController } from './staff.controller';

/**
 * Customer-app features: prescriptions, pharmacist chat, live order tracking,
 * push notifications and account deletion. Global so other modules
 * (e.g. sales) can use PushService / PrescriptionsService.
 */
@Global()
@Module({
  imports: [ConfigModule],
  controllers: [ClientAppController, StaffDeskController],
  providers: [
    PrismaService,
    JwtService,
    ClientAuthGuard,
    PushService,
    PrescriptionsService,
    ChatService,
    OrdersTrackingService,
    AccountService,
    OrderMailService,
  ],
  exports: [PushService, PrescriptionsService, ChatService, OrderMailService],
})
export class MobileModule {}
