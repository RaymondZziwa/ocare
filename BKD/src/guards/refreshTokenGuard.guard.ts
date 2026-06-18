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

    // Extract refresh token from cookies
    let token = request.cookies?.refreshToken;

    // Fallback to Authorization header with "Refresh" prefix
    if (!token && request.headers.authorization) {
      const authHeader = request.headers.authorization;
      if (authHeader.startsWith('Refresh ')) {
        token = authHeader.replace('Refresh ', '');
      }
    }

    if (token) {
      request.headers.authorization = `Bearer ${token}`;
    }

    return request;
  }
}
