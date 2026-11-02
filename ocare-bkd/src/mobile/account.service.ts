import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrescriptionsService } from './prescriptions.service';

/**
 * Account deletion (required by Google Play and the App Store).
 * Personal data is erased; completed sales are kept but anonymised because
 * they are financial records the business must retain.
 */
@Injectable()
export class AccountService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly prescriptions: PrescriptionsService,
  ) {}

  async deleteAccount(clientId: string, password?: string) {
    const client = await this.prisma.client.findUnique({ where: { id: clientId } });
    if (!client || client.deletedAt) throw new NotFoundException('Account not found');

    if (client.provider !== 'Google') {
      if (!password) throw new BadRequestException('Enter your password to confirm.');
      const ok = await bcrypt.compare(password, client.password || '');
      if (!ok) throw new UnauthorizedException('That password is not correct.');
    }

    const prescriptions = await this.prisma.prescription.findMany({
      where: { clientId },
      select: { images: true },
    });

    await this.prisma.$transaction([
      this.prisma.deviceToken.deleteMany({ where: { clientId } }),
      this.prisma.address.deleteMany({ where: { clientId } }),
      this.prisma.clientOtp.deleteMany({ where: { clientId } }),
      this.prisma.chatThread.deleteMany({ where: { clientId } }),
      this.prisma.prescription.deleteMany({ where: { clientId } }),
      this.prisma.client.update({
        where: { id: clientId },
        data: {
          firstName: 'Deleted',
          lastName: 'user',
          fullName: 'Deleted user',
          email: `deleted-${clientId}@deleted.ocare.invalid`,
          phone: null,
          address: null,
          gender: null,
          password: await bcrypt.hash(randomUUID(), 10),
          isEmailVerified: false,
          isPhoneVerified: false,
          deletedAt: new Date(),
        },
      }),
    ]);

    prescriptions.forEach((p) => this.prescriptions.removeFiles(p.images));

    return { status: 200, message: 'Your account and personal data have been deleted.' };
  }
}
