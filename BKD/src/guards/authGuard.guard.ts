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
    if (err || !user) {
      
      throw err || new UnauthorizedException('Invalid or expired access token');
    }

    const request = context.switchToHttp().getRequest<Request>();
    request.user = user;
    return user;
  }

  getRequest(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();

    // Extract token from cookies (your current setup)
    let token = request.cookies?.accessToken;

    // Fallback to Authorization header for flexibility
    if (!token && request.headers.authorization) {
      token = request.headers.authorization.replace('Bearer ', '');
    }

    if (token) {
      request.headers.authorization = `Bearer ${token}`;
    }

    return request;
  }
}
