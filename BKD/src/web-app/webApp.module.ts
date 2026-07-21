import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthController } from './auth/webAuth.controller';
import { AuthService } from './auth/webAuthService.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ResendMailService } from 'src/utils/mailing/mailing.service';
import { VerificationService } from './auth/verification.service';
import { WebProfileService } from './profile/webProfile.service';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    PrismaService,
    JwtService,
    ResendMailService,
    ConfigService,
    VerificationService,
    WebProfileService,
  ],
})
export class WebAppModule {}
