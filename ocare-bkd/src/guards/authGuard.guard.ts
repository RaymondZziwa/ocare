// src/auth/guards/jwt-auth.guard.ts
import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
      console.log('user', user);
       console.log('err', err);
    if (err || !user) {
      throw err || new UnauthorizedException('Invalid or expired access token');
    }

    const request = context.switchToHttp().getRequest<Request>();
    request.user = user;
    return user;
  }

  getRequest(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();

    // Authorization header first (Portal), cookie as fallback
    const header = request.headers.authorization;
    const token = header?.startsWith('Bearer ')
      ? header.slice(7)
      : request.cookies?.accessToken;

    if (token) {
      request.headers.authorization = `Bearer ${token}`;
    }

    return request;
  }
}
