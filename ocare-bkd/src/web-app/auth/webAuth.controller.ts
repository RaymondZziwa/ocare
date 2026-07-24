import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './webAuthService.service';
import { GoogleOauthGuard } from 'src/guards/googleAuth.guard';
import {
  emailUpdateDto,
  passwordResetDto,
  updateProfileDto,
  WebLoginDto,
  WebRegisterDto,
} from '../dto/WebAuth.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ForgotPasswordDto } from 'src/dto/forgotPwd.dto';
import { WebProfileService } from '../profile/webProfile.service';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('api/web-auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private webProfileService: WebProfileService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('/register')
  async register(@Body() dto: WebRegisterDto) {
    return this.authService.registerUser(dto);
  }

  @Get('verify-email')
  async verifyEmail(
    @Query('token') token: string,
    @Res() res: Response,
    @Query('newEmail') newEmail?: string,
  ) {
    if (!token) {
      throw new BadRequestException('Verification token is missing');
    }

    try {
      // Verify the JWT using the same secret used to sign it
      const payload: { sub: string; purpose: string } = this.jwtService.verify(
        token,
        {
          secret: this.configService.get<string>('JWT_VERIFICATION_SECRET'),
        },
      );

      // Check the purpose to ensure it's an email verification token
      if (
        payload.purpose !== 'email-verification' &&
        payload.purpose !== 'email-update'
      ) {
        throw new UnauthorizedException('Invalid token purpose');
      }

      const userId = payload.sub;
      // Mark the user's email as verified in your database or update email
      if (payload.purpose === 'email-verification') {
        await this.authService.markEmailAsVerified(userId);
        return res.redirect(
          `${this.configService.getOrThrow('FRONTEND_URL')}/verify-email?token=${token}`,
        );
      } else {
        await this.webProfileService.updateEmail(userId, newEmail || '');
      }
    } catch (error) {
      console.log(error);
      // JWT verification fails if expired or tampered
      throw new UnauthorizedException('Invalid or expired verification token');
    }
  }

  @Post('/sign-in')
  async signIn(@Body() dto: WebLoginDto) {
    return this.authService.signIn(dto);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  async resetPassword(
    @Query('token') token: string,
    @Body() dto: passwordResetDto,
  ) {
    if (!token) {
      throw new BadRequestException('Password reset token is missing');
    }

    try {
      // Verify the JWT using the same secret used to sign it
      const payload: { sub: string; purpose: string } = this.jwtService.verify(
        token,
        {
          secret: this.configService.get<string>('JWT_RESET_SECRET'),
        },
      );

      // Check the purpose to ensure it's a password-reset token
      if (payload.purpose !== 'password-reset') {
        throw new UnauthorizedException('Invalid token purpose');
      }

      const userId = payload.sub;
      // Mark the user's email as verified in your database
      return await this.webProfileService.updatePassword(
        userId,
        dto.newPassword,
      );
    } catch (error) {
      console.log('err', error);
      // JWT verification fails if expired or tampered
      throw new UnauthorizedException('Invalid or expired reset token');
    }
  }

  @Post('update-email')
  async emailUpdate(@Body() dto: emailUpdateDto) {
    return this.webProfileService.verifyEmail(dto.id, dto.newEmail);
  }

  @Post('profile-update')
  async profileUpdate(@Body() dto: updateProfileDto) {
    return this.webProfileService.updateProfile(dto);
  }

  @Post('update-password')
  async passwordUpdate(@Body() dto: { id: string; newPassword: string }) {
    return this.webProfileService.updatePassword(dto.id, dto.newPassword);
  }

  @Get('google')
  @UseGuards(GoogleOauthGuard)
  async auth() {}

  @Get('google/callback')
  @UseGuards(GoogleOauthGuard)
  async googleAuthCallback(@Req() req, @Res() res: Response) {
    const existingUser = await this.authService.findUserByEmail(req.user.email);

    if (!existingUser) {
      const randomPassword = crypto.randomUUID().toString();
      console.log(randomPassword);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      const newUser: {
        fullName: string;
        email: string;
        provider: 'Web' | 'Google' | 'Mobile' | 'In_Shop';
        password: string;
      } = {
        fullName: req.user.fullName,
        provider: 'Google',
        email: req.user.email,
        password: hashedPassword,
      };

      await this.authService.registerUser(newUser);
      const frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL');
      return res.redirect(`${frontendUrl}/check-email?email=${newUser.email}`);
    } else {
      const loginData = {
        email: existingUser.email,
      };

      if (existingUser.provider !== 'Google') {
        const frontendUrl =
          this.configService.getOrThrow<string>('FRONTEND_URL');
        return res.redirect(`${frontendUrl}/auth/callback?require_pwd=${true}`);
      }
      const auth = await this.authService.signIn(loginData);
      // Extract token from the signIn response
      const token = auth.accessToken;

      // Optional: encode user data if you need it on the frontend
      const userData = {
        id: existingUser.id,
        email: existingUser.email,
        fullName: existingUser.fullName,
      };
      const encodedUser = encodeURIComponent(JSON.stringify(userData));

      const frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL');
      return res.redirect(
        `${frontendUrl}/auth/callback?token=${token}&user=${encodedUser}`,
      );
    }
  }

  @Get('me')
  async getMe(@Query('token') token: string) {
    if (!token) {
      throw new BadRequestException('Token is required');
    }

    try {
      // 1. Verify the JWT token
      const payload = this.jwtService.verify(token, {
        secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      });

      const userId: string = payload.sub;

      // 2. Fetch the user from the database
      const user = await this.prisma.client.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          fullName: true,
          phone: true,
          gender: true,
          provider: true,
          isEmailVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // 3. Generate fresh tokens (sign the user in)
      const accessTokenExpiry = '1d';
      const refreshTokenExpiry = '7d';

      const jwtPayload = {
        sub: user.id,
        email: user.email,
        lastName: user.fullName,
      };

      const [accessToken, refreshToken] = await Promise.all([
        this.jwtService.signAsync(jwtPayload, {
          secret:
            this.configService.get<string>('JWT_SECRET') || 'fallback-secret',
          expiresIn: accessTokenExpiry,
        }),
        this.jwtService.signAsync(jwtPayload, {
          secret:
            this.configService.get<string>('JWT_REFRESH_SECRET') ||
            'fallback-refresh-secret',
          expiresIn: refreshTokenExpiry,
        }),
      ]);

      // 4. Return the user and tokens (and optionally set a cookie)
      return {
        user,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
