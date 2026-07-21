import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
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

@Controller('api/web-auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private webProfileService: WebProfileService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  @Post('/register')
  async register(@Body() dto: WebRegisterDto) {
    return this.authService.registerUser(dto);
  }

  @Get('verify-email')
  async verifyEmail(
    @Query('token') token: string,
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
      } else {
        await this.webProfileService.updateEmail(userId, newEmail || '');
      }
      // Return success response (you can also redirect to a frontend success page)
      return {
        success: true,
        message: 'Email verified successfully. You can now log in.',
      };
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

  @Get('google')
  @UseGuards(GoogleOauthGuard)
  async auth() {}

  @Get('google/callback')
  @UseGuards(GoogleOauthGuard)
  async googleAuthCallback(@Req() req, @Res() res: Response) {
    const token = await this.authService.signIn(req.user);

    res.cookie('access_token', token, {
      maxAge: 2592000000,
      sameSite: true,
      secure: false,
    });

    return res.status(HttpStatus.OK);
  }
}
