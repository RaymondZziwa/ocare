import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { WebRegisterDto } from '../dto/WebAuth.dto';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { ResendMailService } from 'src/utils/mailing/mailing.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly resendMailService: ResendMailService,
  ) {}

  private extractFirstAndLastName = (fullName: string) => {
    if (!fullName) return { firstName: '', lastName: '' };

    const parts = fullName.trim().split(/\s+/); // split by one or more spaces

    const firstName = parts[0] || '';
    const lastName = parts.slice(1).join(' ') || ''; // everything after the first word

    return { firstName, lastName };
  };

  async signIn(loginData: {
    email: string;
    password?: string;
    rememberMe?: boolean;
  }) {
    const { email, password, rememberMe } = loginData;

    try {
      // 1. Find user by email
      const user = await this.prisma.client.findUnique({
        where: { email },
      });

      if (!user) {
        throw new NotFoundException('Credentials are unknown to us.');
      }

      // 2. For non-Google users, verify password
      if (user.provider !== 'Google') {
        if (!password) {
          throw new BadRequestException(
            'Password is required for email login.',
          );
        }
        const isValid = await bcrypt.compare(password, user.password || '');
        if (!isValid) {
          throw new UnauthorizedException('Invalid credentials');
        }
      }

      // 3. Generate tokens (same for both flows)
      const payload = {
        sub: user.id,
        email: user.email,
        lastName: user.lastName,
      };

      // Determine token expiry based on a "remember me" flag (you can pass it as an optional param)
      const accessTokenExpiry = rememberMe ? '7d' : '1d';
      const refreshTokenExpiry = rememberMe ? '30d' : '7d';

      const [accessToken, refreshToken] = await Promise.all([
        this.jwtService.signAsync(payload, {
          secret:
            this.configService.get<string>('JWT_SECRET') || 'fallback-secret',
          expiresIn: accessTokenExpiry,
        }),
        this.jwtService.signAsync(payload, {
          secret:
            this.configService.get<string>('JWT_REFRESH_SECRET') ||
            'fallback-refresh-secret',
          expiresIn: refreshTokenExpiry,
        }),
      ]);

      // 4. Return consistent response
      return {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          phone: user.phone,
          gender: user.gender,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        accessToken,
        refreshToken,
        status: 200,
      };
    } catch (err) {
      console.log(err);
      if (err instanceof HttpException) {
        throw err;
      }

      // Otherwise, treat it as an internal server error
      throw new InternalServerErrorException(
        'There was an error while signing you in.',
      );
    }
  }

  async registerUser(user: WebRegisterDto) {
    try {
      const existingUser = await this.prisma.client.findFirst({
        where: {
          OR: [{ email: user.email }, { phone: user.phone }],
        },
      });
      if (existingUser)
        throw new BadRequestException(
          'Email or Phone Number is already associated with an account',
        );

      const names = this.extractFirstAndLastName(user.fullName);
      const hashedPassword = await bcrypt.hash(user.password, 10);
      const newUser = await this.prisma.client.create({
        data: {
          fullName: user.fullName,
          firstName: names.firstName,
          lastName: names.lastName,
          provider: user.provider,
          gender: user.gender || 'Unknown',
          email: user.email,
          phone: user.phone || '',
          password: hashedPassword,
        },
      });

      await this.resendMailService.sendOnRegistration(
        names.lastName,
        user.email,
        newUser.id,
      );
      return {
        message:
          'Your account has been created successfully. Please check your email for the verification link',
      };
    } catch (err) {
      console.log(err);
      if (err instanceof HttpException) {
        throw err;
      }

      // Otherwise, treat it as an internal server error
      throw new InternalServerErrorException(
        'There was an error while creating your account',
      );
    }
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.client.findUnique({
      where: {
        email,
      },
    });

    if (!user)
      throw new NotFoundException('The email you provided is unknown to us');

    try {
      await this.resendMailService.sendOnForgotPassword(
        user.lastName,
        user?.email || email,
        user.id,
      );
      return {
        message:
          'If the email you have provided is known to us, you shall recieve the password reset link in your inbox.',
      };
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }

      // Otherwise, treat it as an internal server error
      throw new InternalServerErrorException(
        'There was an error while resetting your password',
      );
    }
  }
  async findUserByEmail(email: string) {
    const user = await this.prisma.client.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      return null;
    }

    return user;
  }

  async markEmailAsVerified(id: string) {
    const user = await this.prisma.client.findUnique({
      where: {
        id,
      },
    });

    if (!user) throw new NotFoundException('User not found');

    await this.prisma.client.update({
      where: {
        id,
      },
      data: {
        isEmailVerified: true,
      },
    });

    return {
      message: 'Your email has been verified.',
    };
  }

  async changePassword(dto: { id: string; newPassword: string }) {
    const user = await this.prisma.client.findUnique({
      where: {
        id: dto.id,
      },
    });

    if (!user) throw new NotFoundException('User not found');

    const hashedPwd = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.client.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPwd,
      },
    });

    return {
      message: 'Password updated successfully',
    };
  }
}
