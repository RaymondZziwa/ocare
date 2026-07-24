import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResendMailService } from 'src/utils/mailing/mailing.service';
import { updateProfileDto } from '../dto/WebAuth.dto';

@Injectable()
export class WebProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly resendMailService: ResendMailService,
  ) {}

  async findUserByEmail(email: string) {
    const user = await this.prisma.client.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      return null;
    }

    return user;
  }

  async updateProfile(dto: updateProfileDto) {
    try {
      const user = await this.prisma.client.findUnique({
        where: {
          id: dto.id,
        },
      });

      if (!user) throw new NotFoundException('User not found');

      await this.prisma.client.update({
        where: {
          id: dto.id,
        },
        data: {
          fullName: dto.fullName,
          phone: dto.phone,
          gender: dto.gender || 'unknown',
        },
      });

      return {
        message: 'Your profile has been updated successfully',
      };
    } catch {
      throw new InternalServerErrorException(
        'There was an issue while updating profile',
      );
    }
  }

  async updateEmail(id: string, newEmail: string) {
    try {
      const user = await this.prisma.client.findUnique({
        where: {
          id,
        },
      });

      if (!user) throw new NotFoundException('User account not found.');

      await this.prisma.client.update({
        where: {
          id,
        },
        data: {
          email: newEmail,
        },
      });
    } catch {
      throw new InternalServerErrorException(
        'There was an issue while updating your email',
      );
    }
  }

  async verifyEmail(id: string, newEmail: string) {
    try {
      const user = await this.prisma.client.findUnique({
        where: {
          id,
        },
      });

      if (!user) throw new NotFoundException('User account not found.');

      await this.resendMailService.sendOnEmailChange(
        user.lastName,
        newEmail,
        user.id,
      );

      return {
        message:
          'A verification email has been sent to your new email. Verify to complete email update',
      };
    } catch {
      throw new InternalServerErrorException(
        'There was an issue while verifying your email',
      );
    }
  }

  async updatePassword(id: string, newPassword: string) {
    try {
      const user = await this.prisma.client.findUnique({
        where: {
          id,
        },
      });

      if (!user) throw new NotFoundException('User account not found.');

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      await this.prisma.client.update({
        where: {
          id,
        },
        data: {
          password: hashedNewPassword,
        },
      });

      return {
        message: 'Password updated successfully',
        status: 200,
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'There was an issue while updating your password',
      );
    }
  }

  //addresses
  async saveAddress(dto: {
    clientId: string;
    label: string;
    town: string;
    village: string;
    landMark: string;
  }) {
    await this.prisma.address.create({
      data: {
        label: dto.label,
        town: dto.town,
        village: dto.village,
        landmark: dto.landMark,
        client: {
          connect: { id: dto.clientId },
        },
      },
    });
    return {
      message: 'Address saved successfully',
    };
  }

  async setDefaultAddress(id: string) {
    const add = await this.prisma.address.findUnique({
      where: {
        id,
      },
    });

    if (!add) throw new NotFoundException('Address not found');

    await this.prisma.address.update({
      where: {
        id,
      },
      data: {
        isDefault: true,
      },
    });

    return {
      message: 'Address successfully set to default',
    };
  }

  async deleteAddress(id: string) {
    const add = await this.prisma.address.findUnique({
      where: {
        id,
      },
    });

    if (!add) throw new NotFoundException('Address not found');

    await this.prisma.address.delete({
      where: {
        id,
      },
    });

    return {
      message: 'Address deleted successfully',
    };
  }
}
