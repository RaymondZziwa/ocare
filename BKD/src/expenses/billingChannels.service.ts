import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { VerifyMeterNumberDto } from 'src/dto/utility.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { GenericResponse } from 'src/utils/genericResponse';
import { v4 as uuidv4 } from 'uuid';

interface IMeterVerificationResponse {
  status: number;
  data: {
    status: 'success' | 'error' | 'failed';
    message: string;
    data: {
      customer_details: {
        customer_ref: string;
        customer_name: string;
        outstanding_balance: string;
        area: string;
        customer_type: 'PREPAID' | 'POSTPAID' | 'COMMERCIAL' | 'RESIDENTIAL';
        last_payment_date: string;
        last_payment_amount: string;
      };
      utility_code: 'NWSC' | 'UEDCL' | 'OTHER';
      meter_number: string;
    };
  };
}

@Injectable()
export class BillingChannelsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async create(data: {
    utility: 'LIGHT' | 'NWSC';
    meterNumber: string;
  }): Promise<GenericResponse> {
    const billingChannel = await this.prismaService.billingChannel.create({
      data,
    });
    return {
      status: 200,
      data: billingChannel,
      message: 'Billing channel created successfully',
    };
  }

  async findAll(): Promise<GenericResponse> {
    const billingChannels = await this.prismaService.billingChannel.findMany();
    return {
      status: 200,
      data: billingChannels,
      message: 'Billing channels fetched successfully',
    };
  }

  async update(
    id: number,
    data: { name?: string; location?: string },
  ): Promise<GenericResponse> {
    const billingChannel = await this.prismaService.billingChannel.update({
      where: { id },
      data,
    });
    return {
      status: 200,
      data: billingChannel,
      message: 'Billing channel modified successfully',
    };
  }

  async remove(id: number): Promise<GenericResponse> {
    const billingChannel = await this.prismaService.billingChannel.delete({
      where: { id },
    });
    return {
      status: 200,
      data: billingChannel,
      message: 'Billing channel deleted successfully',
    };
  }

  async getNwscAreas() {
    const authHeader = this.configService.get<string>('MARZ_AUTH_HEADER');

    const response = await firstValueFrom(
      this.httpService.get(
        this.configService.getOrThrow<string>('MARZ_NWSC_AREAS_URL'),
        {
          headers: {
            Authorization: `Basic ${authHeader}`,
            'Content-Type': 'application/json',
          },
        },
      ),
    );

    return response.data;
  }
  async verifyChannel(data: VerifyMeterNumberDto) {
    const channel = await this.prismaService.billingChannel.findUnique({
      where: { id: data.channelId },
    });

    if (!channel) {
      return {
        status: 404,
        data: null,
        message: 'Billing channel not found',
      };
    }

    const payload = {
      meter_number: data.meterNumber,
      utility_code: data.utilityType,
      area: channel.area || data.area,
      reference: uuidv4(), // Generate a unique reference for this verification request
    };

    console.log('Verifying meter number with payload:', payload);
    const authHeader = this.configService.get<string>('MARZ_AUTH_HEADER');

    const response: IMeterVerificationResponse = await firstValueFrom(
      this.httpService.post(
        this.configService.getOrThrow<string>(
          'MARZ_UTITLITY_METER_VERIFICATION_URL',
        ),
        payload,
        {
          headers: {
            Authorization: `Basic ${authHeader}`,
            'Content-Type': 'application/json',
          },
        },
      ),
    );

    //console.log('response', response);
    if (response.data.status.toLowerCase() === 'success') {
      await this.prismaService.billingChannel.update({
        where: { id: data.channelId },
        data: {
          isVerified: true,
          name: response.data.data.customer_details.customer_name,
          meterNumber: data.meterNumber,
          area: response.data.data.customer_details.area,
        },
      });
      return {
        status: 200,
        data: response.data,
        message: 'Meter number verified successfully',
      };
    } else {
      return {
        status: 400,
        data: null,
        message: response.data.message || 'Meter number verification failed',
      };
    }
  }
}
