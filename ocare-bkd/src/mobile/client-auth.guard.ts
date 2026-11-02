import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';

export interface AuthedClient {
  id: string;
  email: string;
  fullName: string;
  provider: string;
}

/**
 * Protects customer-app endpoints. Customer tokens are issued by
 * web-app/auth (sub = client id) and signed with JWT_SECRET.
 */
@Injectable()
export class ClientAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request & { client?: AuthedClient }>();
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : req.cookies?.accessToken;
    if (!token) throw new UnauthorizedException('Please sign in again.');

    let sub: string;
    try {
      const payload = await this.jwt.verifyAsync<{ sub: string }>(token, {
        secret: this.config.get<string>('JWT_SECRET') || 'fallback-secret',
      });
      sub = String(payload.sub);
    } catch {
      throw new UnauthorizedException('Your session has expired. Please sign in again.');
    }

    const client = await this.prisma.client.findUnique({
      where: { id: sub },
      select: { id: true, email: true, fullName: true, provider: true, deletedAt: true },
    });
    if (!client || client.deletedAt) throw new UnauthorizedException('Account not found.');

    req.client = { id: client.id, email: client.email, fullName: client.fullName, provider: client.provider };
    return true;
  }
}
