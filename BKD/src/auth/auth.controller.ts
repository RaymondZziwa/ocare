// src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  HttpCode,
  UseGuards,
  Get,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { AuthDto } from 'src/dto/auth.dto';
import { JwtAuthGuard } from 'src/guards/authGuard.guard';
import { RefreshAuthGuard } from 'src/guards/refreshTokenGuard.guard';

// Define the user type that matches what your guards return
interface AuthUser {
  id: string;
  // Add other properties that your JWT payload contains
  email?: string;
  firstName?: string;
  lastName?: string;
}

// Extend the Express Request type
declare module 'express' {
  interface Request {
    user?: AuthUser;
  }
}

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(200)
  @Post('login')
  async login(
    @Body() loginDto: AuthDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const authResult = await this.authService.login(loginDto);
    const { token, ...userData } = authResult;

    const forwardedProto = req.headers['x-forwarded-proto'];
    const isForwardedHttps =
      typeof forwardedProto === 'string'
        ? forwardedProto.includes('https')
        : false;

    const origin = req.headers.origin;
    const isHttpsOrigin =
      typeof origin === 'string' ? origin.startsWith('https://') : false;

    const isHttpsRequest = req.secure || isForwardedHttps;
    const useCrossSiteCookies = [
      isHttpsRequest,
      process.env.NODE_ENV === 'production',
      isHttpsOrigin,
    ].some(Boolean);

    const sameSite: 'none' | 'lax' = useCrossSiteCookies ? 'none' : 'lax';
    const cookieOptions = {
      httpOnly: true,
      secure: useCrossSiteCookies,
      sameSite,
    };

    // Set HTTP-only cookies
    res.cookie('accessToken', token.accessToken, {
      ...cookieOptions,
      maxAge: 86400000, // 1 day
    });

    res.cookie('refreshToken', token.refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 86400000, // 7 days
    });

    console.log(userData);
    // Remove tokens from the response since they're in cookies
    return {
      message: 'Login successful',
      user: userData,
    };
  }

  @HttpCode(200)
  @Post('pbd/login')
  async Pbdlogin(
    @Body() loginDto: AuthDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const authResult = await this.authService.pbdLogin(loginDto);
    const { token, ...userData } = authResult;

    const forwardedProto = req.headers['x-forwarded-proto'];
    const isForwardedHttps =
      typeof forwardedProto === 'string'
        ? forwardedProto.includes('https')
        : false;

    const origin = req.headers.origin;
    const isHttpsOrigin =
      typeof origin === 'string' ? origin.startsWith('https://') : false;

    const isHttpsRequest = req.secure || isForwardedHttps;
    const useCrossSiteCookies =
      isHttpsRequest || process.env.NODE_ENV === 'production' || isHttpsOrigin;

    const sameSite: 'none' | 'lax' = useCrossSiteCookies ? 'none' : 'lax';
    const cookieOptions = {
      httpOnly: true,
      secure: useCrossSiteCookies,
      sameSite,
    };

    // Set HTTP-only cookies
    res.cookie('accessToken', token.accessToken, {
      ...cookieOptions,
      maxAge: 86400000, // 1 day
    });

    res.cookie('refreshToken', token.refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 86400000, // 7 days
    });

    // Remove tokens from the response since they're in cookies
    return {
      message: 'Login successful',
      user: userData,
    };
  }

  @Get('verify')
  @UseGuards(JwtAuthGuard)
  verifyAuth(@Req() req: Request) {
    console.log('Verifying authentication for user:', req.user);

    // If JwtAuthGuard passes, the user is authenticated
    if (!req.user) {
      throw new UnauthorizedException('User not authenticated');
    }

    return {
      status: 200,
      message: 'Authentication valid',
      data: {
        isValid: true,
        user: req.user,
      },
    };
  }

  /**
   * Get current authenticated user's complete profile
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@Req() req: Request) {
    if (!req.user) {
      throw new UnauthorizedException('User not authenticated');
    }

    const user = await this.authService.getCurrentUser(req.user.id);
    return {
      status: 200,
      message: 'User data retrieved successfully',
      data: user,
    };
  }

  /**
   * Refresh access token using refresh token
   */
  @Post('refresh')
  @UseGuards(RefreshAuthGuard)
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!req.user) {
      throw new UnauthorizedException('User not authenticated');
    }

    const newTokens = await this.authService.refreshTokens(req.user.id);

    const forwardedProto = req.headers['x-forwarded-proto'];
    const isForwardedHttps =
      typeof forwardedProto === 'string'
        ? forwardedProto.includes('https')
        : false;

    const origin = req.headers.origin;
    const isHttpsOrigin =
      typeof origin === 'string' ? origin.startsWith('https://') : false;

    const isHttpsRequest = req.secure || isForwardedHttps;
    const useCrossSiteCookies =
      isHttpsRequest || process.env.NODE_ENV === 'production' || isHttpsOrigin;

    const sameSite: 'none' | 'lax' = useCrossSiteCookies ? 'none' : 'lax';
    const cookieOptions = {
      httpOnly: true,
      secure: useCrossSiteCookies,
      sameSite,
    };

    // Set new HTTP-only cookies
    res.cookie('accessToken', newTokens.accessToken, {
      ...cookieOptions,
      maxAge: 86400000, // 1 day
    });

    res.cookie('refreshToken', newTokens.refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 86400000, // 7 days
    });

    return {
      status: 200,
      message: 'Tokens refreshed successfully',
    };
  }

  /**
   * Logout - clear cookies
   */
  @Post('logout')
  logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const forwardedProto = req.headers['x-forwarded-proto'];
    const isForwardedHttps =
      typeof forwardedProto === 'string'
        ? forwardedProto.includes('https')
        : false;

    const origin = req.headers.origin;
    const isHttpsOrigin =
      typeof origin === 'string' ? origin.startsWith('https://') : false;

    const isHttpsRequest = req.secure || isForwardedHttps;
    const useCrossSiteCookies =
      isHttpsRequest || process.env.NODE_ENV === 'production' || isHttpsOrigin;

    const sameSite: 'none' | 'lax' = useCrossSiteCookies ? 'none' : 'lax';
    const cookieOptions = {
      httpOnly: true,
      secure: useCrossSiteCookies,
      sameSite,
    };

    // Clear the HTTP-only cookies
    res.cookie('accessToken', '', {
      ...cookieOptions,
      maxAge: 0, // Expire immediately
    });

    res.cookie('refreshToken', '', {
      ...cookieOptions,
      maxAge: 0, // Expire immediately
    });

    return {
      status: 200,
      message: 'Logout successful',
    };
  }
}
