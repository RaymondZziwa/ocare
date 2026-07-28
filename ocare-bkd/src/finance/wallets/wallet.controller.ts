import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { CreateWalletDto, UpdateWalletDto } from './dto';

@Controller('api/wallets')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post('create')
  create(@Body() createWalletDto: CreateWalletDto) {
    return this.walletService.create(createWalletDto);
  }

  @Get('all')
  findAll() {
    return this.walletService.findAll();
  }

  @Patch('modify/:id')
  update(@Param('id') id: string, @Body() updateWalletDto: UpdateWalletDto) {
    return this.walletService.update(id, updateWalletDto);
  }

  @Post('toggle/:id')
  toggleWallet(@Param('id') id: string) {
    return this.walletService.toggleWallet(id);
  }

  @Post('toggle-app-wallet/:id')
  toggleAppWallet(@Param('id') id: string) {
    return this.walletService.toggleAppWallet(id);
  }

  @Post('toggle-web-wallet/:id')
  toggleWebWallet(@Param('id') id: string) {
    return this.walletService.toggleWebWallet(id);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.walletService.remove(id);
  }
}
