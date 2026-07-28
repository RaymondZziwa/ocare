import {
  Controller,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Request,
  HttpStatus,
  HttpCode,
  Get,
} from '@nestjs/common';
import { WebProfileService } from '../profile/webProfile.service';
import { CreateAddressDto } from '../dto/WebAuth.dto';

@Controller('api/addresses')
export class AddressController {
  constructor(private readonly addressService: WebProfileService) {}

  /**
   * Save a new address for the authenticated user
   */
  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  async saveAddress(@Request() req, @Body() dto: CreateAddressDto) {
    return this.addressService.saveAddress({
      clientId: dto.clientId,
      label: dto.label,
      town: dto.town,
      village: dto.village,
      landMark: dto.landmark || '',
    });
  }

  /**
   * Set an address as the default for the user
   */
  @Patch(':id/default')
  @HttpCode(HttpStatus.OK)
  async setDefaultAddress(@Param('id') id: string) {
    return this.addressService.setDefaultAddress(id);
  }

  /**
   * Delete an address
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteAddress(@Param('id') id: string) {
    return this.addressService.deleteAddress(id);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getAddress(@Param('id') id: string) {
    return this.addressService.getAddresses(id);
  }
}
