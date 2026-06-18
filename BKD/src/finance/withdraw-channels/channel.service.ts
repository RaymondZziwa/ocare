import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from 'src/prisma/prisma.service';
import { GenericResponse } from 'src/utils/genericResponse';
import { ValidateBankAccountDto } from './dto/validateBankAccount.dto';

@Injectable()
export class ChannelService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async create(data: {
    type: 'BANK_TRANSFER' | 'MOBILE_MONEY';
    name: string;
    phoneNumber?: string;
    bank?: string;
    accountNumber?: string;
  }): Promise<GenericResponse> {
    const channel = await this.prismaService.withdrawChannel.create({ data });
    return {
      status: 200,
      data: channel,
      message: 'Channel created successfully',
    };
  }

  async findAll(): Promise<GenericResponse> {
    const channels = await this.prismaService.withdrawChannel.findMany();
    return {
      status: 200,
      data: channels,
      message: 'Channels fetched successfully',
    };
  }

  async update(
    id: number,
    data: {
      type?: 'BANK_TRANSFER' | 'MOBILE_MONEY';
      name?: string;
      phoneNumber?: string;
      bank?: string;
      accountNumber?: string;
    },
  ): Promise<GenericResponse> {
    const channel = await this.prismaService.withdrawChannel.update({
      where: { id },
      data,
    });
    return {
      status: 200,
      data: channel,
      message: 'Channel modified successfully',
    };
  }

  async remove(id: number): Promise<GenericResponse> {
    const channel = await this.prismaService.withdrawChannel.delete({
      where: { id },
    });
    return {
      status: 200,
      data: channel,
      message: 'Channel deleted successfully',
    };
  }

  //get list of supported banks
  async getSupportedBanks(): Promise<GenericResponse> {
    const authHeader = this.configService.get<string>('MARZ_AUTH_HEADER');

    const response = await firstValueFrom(
      this.httpService.get(
        this.configService.getOrThrow<string>('MARZ_SUPPORTED_BANKS_URL'),
        {
          headers: {
            Authorization: `Basic ${authHeader}`,
            'Content-Type': 'application/json',
          },
        },
      ),
    );
    return {
      status: 200,
      data: response.data,
      message: 'Supported banks fetched successfully',
    };
  }

  async sendMobileMoneyVerificationCode(id: number): Promise<GenericResponse> {
    const channel = await this.prismaService.withdrawChannel.findUnique({
      where: { id },
    });

    if (!channel) {
      return {
        status: 404,
        data: null,
        message: 'Channel not found',
      };
    }

    if (channel.type !== 'MOBILE_MONEY') {
      return {
        status: 400,
        data: null,
        message: 'Channel is not a mobile money channel',
      };
    }

    const smsUrl = this.configService.get<string>('SMS_URL');
    const smsSecret = this.configService.get<string>('SMS_SECRET');

    const generateSixDigitPIN = (): string => {
      return Math.floor(100000 + Math.random() * 900000).toString();
    };

    const message = `PBMS channel verification code: ${generateSixDigitPIN()}. This code will expire in 10 minutes.`;

    const smsEndpoint = `${smsUrl}/sms/send`;
    const response = await firstValueFrom(
      this.httpService.post(
        smsEndpoint,
        {
          recipients: channel.phoneNumber,
          message: message,
        },
        {
          headers: {
            'api-key': smsSecret,
            'Content-Type': 'application/json',
          },
        },
      ),
    );

    console.log('SMS response', response.data);

    await this.prismaService.channelVerificationCode.create({
      data: {
        channelId: id,
        code: message.split(': ')[1].split('.')[0], //extract the code from the message
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), //set expiration time to 10 minutes from now
      },
    });

    return {
      status: 200,
      data: null,
      message: 'Verification code sent successfully',
    };
  }

  async validateMobileMoneyVerificationCode(
    channelId: number,
    code: string,
  ): Promise<GenericResponse> {
    const record = await this.prismaService.channelVerificationCode.findFirst({
      where: {
        channelId,
        code,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!record) {
      return {
        status: 400,
        data: null,
        message: 'Invalid or expired verification code',
      };
    }

    // Verify the sent code matches the record code
    if (record.code === code) {
      // Update channel to verified only if codes match
      await this.prismaService.withdrawChannel.update({
        where: { id: channelId },
        data: { isVerified: true },
      });
    }

    // Delete the record after successful validation
    await this.prismaService.channelVerificationCode.delete({
      where: { id: record.id },
    });

    return {
      status: 200,
      data: null,
      message: 'Verification code validated successfully',
    };
  }

  //validate bank account details
  //validate bank account details
  //validate bank account details
  async validateBankAccountDetails(id: string): Promise<GenericResponse> {
    try {
      const authHeader = this.configService.get<string>('MARZ_AUTH_HEADER');

      const channel = await this.prismaService.withdrawChannel.findUnique({
        where: { id: parseInt(id) },
      });

      if (!channel) {
        return {
          status: 404,
          data: null,
          message: 'Channel not found',
        };
      }

      if (channel.type !== 'BANK_TRANSFER') {
        return {
          status: 400,
          data: null,
          message: 'Channel is not a bank transfer channel',
        };
      }

      const response = await firstValueFrom(
        this.httpService.post(
          this.configService.getOrThrow<string>(
            'MARZ_GET_VALIDATE_BANK_ACCOUNT_URL',
          ),
          {
            account_number: channel.accountNumber,
            bank_name: channel.bank,
          },
          {
            headers: {
              Authorization: `Basic ${authHeader}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      console.log('response-data', response.data);
      // Check if validation was successful based on response data
      const isValid =
        response.data?.status?.toLowerCase() === 'success' ||
        response.data?.data?.isValid === true ||
        response.data?.verified === true;

      if (isValid) {
        await this.prismaService.withdrawChannel.update({
          where: { id: parseInt(id) },
          data: { isVerified: true, name: response.data.data.account_name },
        });

        // Return 200 for successful validation
        return {
          status: 200,
          data: response.data,
          message: 'Bank account details have been verified successfully',
        };
      } else {
        // Return 400 for validation failure - THIS IS THE KEY CHANGE
        return {
          status: 400,
          data: response.data,
          message:
            response.data?.message ||
            'Bank account details validation failed. Check the provided details and try again',
        };
      }
    } catch (error) {
      console.error('Bank account validation error:', error);

      if (error.response) {
        // Check if it's a validation error from external API
        const isValidationError =
          error.response.status === 400 || error.response.status === 422;

        if (isValidationError) {
          return {
            status: 400,
            data: error.response.data,
            message:
              error.response.data?.message || 'Bank account validation failed',
          };
        }

        return {
          status: error.response.status || 500,
          data: error.response.data,
          message:
            error.response.data?.message || 'External API error occurred',
        };
      }

      return {
        status: 500,
        data: null,
        message: error.message || 'Internal server error',
      };
    }
  }
}
