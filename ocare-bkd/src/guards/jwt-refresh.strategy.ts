// // src/auth/strategies/jwt-refresh.strategy.ts
// import { ExtractJwt, Strategy } from 'passport-jwt';
// import { PassportStrategy } from '@nestjs/passport';
// import { Injectable, UnauthorizedException } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { AuthService } from 'src/auth/auth.service';
// import type { Request } from 'express';

// type JwtRefreshPayload = {
//   sub: string;
//   email?: string;
//   lastName?: string;
// };

// @Injectable()
// export class JwtRefreshStrategy extends PassportStrategy(
//   Strategy,
//   'jwt-refresh',
// ) {
//   constructor(
//     private readonly authService: AuthService,
//     private readonly configService: ConfigService,
//   ) {
//     super({
//       jwtFromRequest: ExtractJwt.fromExtractors([
//         (request: Request) => {
//           // Check cookies for refresh token
//           let token: string | null = request.cookies?.refreshToken ?? null;

//           // Fallback to Authorization header
//           if (!token && request.headers.authorization) {
//             const authHeader = request.headers.authorization;
//             if (authHeader.startsWith('Refresh ')) {
//               token = authHeader.replace('Refresh ', '');
//             }
//           }

//           return token;
//         },
//       ]),
//       ignoreExpiration: false,
//       secretOrKey:
//         configService.get<string>('JWT_REFRESH_SECRET') ||
//         'fallback-refresh-secret',
//     });
//   }

//   async validate(payload: JwtRefreshPayload) {
//     const rawUserId = payload?.sub;
//     const userId = rawUserId;

//     if (!Number.isFinite(userId)) {
//       throw new UnauthorizedException('Invalid or expired refresh token');
//     }

//     const user = await this.authService.validateUser(userId);

//     if (!user) {
//       throw new UnauthorizedException('User not found or inactive');
//     }

//     return user;
//   }
// }
