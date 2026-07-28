import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ChannelController } from './channels/channel.controller';
import { ChannelService } from './channels/channel.service';
import { WalletService } from './wallets/wallet.service';
import { WalletController } from './wallets/wallet.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [ChannelController, WalletController],
  providers: [
    WalletService,
    ChannelService,
    PrismaService,
    JwtService,
    ConfigService,
  ],
})
export class FinanceModule {}
