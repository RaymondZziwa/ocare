import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class VerificationService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  generateVerificationToken(userId: string): string {
    const payload = { sub: userId, purpose: 'email-verification' };
    return this.jwtService.sign(payload, {
      expiresIn: '24h',
      secret: this.configService.getOrThrow<string>('JWT_VERIFICATION_SECRET'),
    });
  }

  generateEmailUpdateToken(userId: string): string {
    const payload = { sub: userId, purpose: 'email-update' };
    return this.jwtService.sign(payload, {
      expiresIn: '24h',
      secret: this.configService.getOrThrow<string>('JWT_VERIFICATION_SECRET'),
    });
  }

  generateResetToken(userId: string): string {
    const payload = { sub: userId, purpose: 'password-reset' };
    return this.jwtService.sign(payload, {
      expiresIn: '1h', // shorter for security
      secret: this.configService.getOrThrow<string>('JWT_RESET_SECRET'),
    });
  }

  getVerificationLink(userId: string): string {
    const token = this.generateVerificationToken(userId);
    const baseUrl = this.configService.getOrThrow<string>('APP_URL');
    return `${baseUrl}/api/web-auth/verify-email?token=${encodeURIComponent(token)}`;
  }

  getNewEmailVerificationLink(userId: string, newEmail: string): string {
    const token = this.generateEmailUpdateToken(userId);
    const baseUrl = this.configService.getOrThrow<string>('APP_URL');
    return `${baseUrl}/api/web-auth/verify-email?token=${encodeURIComponent(token)}&newEmail=${newEmail}`;
  }

  getResetLink(userId: string): string {
    const token = this.generateResetToken(userId);
    const baseUrl = this.configService.getOrThrow<string>('FRONTEND_URL');
    return `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;
  }
}
