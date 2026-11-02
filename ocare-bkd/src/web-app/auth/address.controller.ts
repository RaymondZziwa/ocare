import {
  Controller,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  HttpStatus,
  HttpCode,
  Get,
  UseGuards,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { WebProfileService } from '../profile/webProfile.service';
import { CreateAddressDto } from '../dto/WebAuth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ClientAuthGuard, type AuthedClient } from 'src/mobile/client-auth.guard';

type ClientReq = { client: AuthedClient };

/** Saved delivery addresses. Customers can only see and change their own. */
@Controller('api/addresses')
@UseGuards(ClientAuthGuard)
export class AddressController {
  constructor(
    private readonly addressService: WebProfileService,
    private readonly prisma: PrismaService,
  ) {}

  private async assertOwner(req: ClientReq, addressId: string) {
    const address = await this.prisma.address.findUnique({ where: { id: addressId }, select: { clientId: true } });
    if (!address) throw new NotFoundException('Address not found');
    if (address.clientId !== req.client.id) throw new ForbiddenException();
  }

  /** Save a new address for the signed-in customer */
  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  async saveAddress(@Req() req: ClientReq, @Body() dto: CreateAddressDto) {
    return this.addressService.saveAddress({
      clientId: req.client.id,
      label: dto.label,
      town: dto.town,
      village: dto.village,
      landMark: dto.landmark || '',
    });
  }

  /** Set an address as the default */
  @Patch(':id/default')
  @HttpCode(HttpStatus.OK)
  async setDefaultAddress(@Req() req: ClientReq, @Param('id') id: string) {
    await this.assertOwner(req, id);
    return this.addressService.setDefaultAddress(id);
  }

  /** Delete an address */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteAddress(@Req() req: ClientReq, @Param('id') id: string) {
    await this.assertOwner(req, id);
    return this.addressService.deleteAddress(id);
  }

  /** List the signed-in customer's addresses (the :id must be their own client id) */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getAddress(@Req() req: ClientReq, @Param('id') id: string) {
    if (id !== req.client.id) throw new ForbiddenException();
    return this.addressService.getAddresses(id);
  }
}
