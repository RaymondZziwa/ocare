import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { WebLoginDto, WebRegisterDto } from '../dto/WebAuth.dto';
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

  async signIn(user: WebLoginDto) {
    const rememberMe = false;
    const accessTokenExpiry = rememberMe ? '7d' : '1d';
    const refreshTokenExpiry = rememberMe ? '30d' : '7d';
    if (!user) {
      throw new BadRequestException('Unauthenticated');
    }
    const existingUser = await this.prisma.client.findUnique({
      where: {
        email: user.email,
      },
    });

    if (!existingUser)
      throw new NotFoundException('Credentials are unknown to us.');

    const isValid = await bcrypt.compare(
      user.password,
      existingUser.password || '',
    );

    if (!isValid) throw new UnauthorizedException('Invalid credentials');

    const payload = {
      sub: existingUser.id,
      email: existingUser.email,
      lastName: existingUser.lastName,
    };

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

    return {
      id: existingUser.id,
      email: existingUser.email,
      fullName: existingUser.fullName,
      phoneNumber: existingUser.phone,
      createdAt: existingUser.createdAt,
      updatedAt: existingUser.updatedAt,
      accessToken,
      refreshToken,
      status: 200,
    };
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
          'Email or Phone Number is already associated to an account',
        );

      const names = this.extractFirstAndLastName(user.fullName);
      const hashedPassword = await bcrypt.hash(user.password, 10);
      const newUser = await this.prisma.client.create({
        data: {
          fullName: user.fullName,
          firstName: names.firstName,
          lastName: names.lastName,
          email: user.email,
          phone: user.phone,
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
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message);
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
    } catch (error) {
      throw new InternalServerErrorException(error?.message);
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
}
