// src/auth/strategies/jwt.strategy.ts
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from 'src/auth/auth.service';
import type { Request } from 'express';

type JwtPayload = {
  sub: string;
  email?: string;
  lastName?: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          // Check cookies first
          let token: string | null = request.cookies?.accessToken ?? null;

          // Fallback to Authorization header
          if (!token && request.headers.authorization) {
            token = request.headers.authorization.replace('Bearer ', '');
          }

          return token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'fallback-secret',
    });
  }

  async validate(payload: JwtPayload) {
    const rawUserId = payload?.sub;
    const userId = rawUserId;

    // Accept string IDs (UUIDs or stringified numbers). Ensure `sub` exists.
    const userIdStr = typeof payload?.sub === 'string' ? payload.sub : String(payload?.sub ?? '');
    if (!userIdStr) {
      throw new UnauthorizedException('Invalid or expired access token');
    }

    const user = await this.authService.validateUser(userIdStr);

    if (!user) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return user;
  }
}
