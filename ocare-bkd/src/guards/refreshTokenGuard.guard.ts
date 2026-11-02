// src/auth/guards/refresh-auth.guard.ts
import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Injectable()
export class RefreshAuthGuard extends AuthGuard('jwt-refresh') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

    handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      throw (
        err || new UnauthorizedException('Invalid or expired refresh token')
      );
    }

    const request = context.switchToHttp().getRequest<Request>();
    request.user = user;
    return user;
  }

  getRequest(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();

    // "Refresh <token>" header first (Portal), cookie as fallback
    const authHeader = request.headers.authorization;
    const token = authHeader?.startsWith('Refresh ')
      ? authHeader.slice(8)
      : request.cookies?.refreshToken;

    if (token) {
      request.headers.authorization = `Refresh ${token}`;
    }

    return request;
  }
}
