import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthDto } from 'src/dto/auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  IRefreshTokenResponse,
  IUserAuthWithoutPassword,
  IUserAuthWithoutToken,
} from 'src/types/userAuth';
import {
  AppLoginDto,
  AppRegisterDto,
  AppSendOtpDto,
  AppVerifyOtpDto,
} from 'src/dto/appAuth.dto';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async login(data: AuthDto): Promise<IUserAuthWithoutPassword> {
    const { loginMethod, email: identifier, password, rememberMe } = data;
    const accessTokenExpiry = rememberMe ? '7d' : '1d';
    const refreshTokenExpiry = rememberMe ? '30d' : '7d';

    try {
      let user: IUserAuthWithoutToken;

      // Find user
      if (loginMethod?.toLowerCase() === 'email') {
        user = await this.prismaService.employee.findUniqueOrThrow({
          where: { email: identifier },
          include: {
            branch: { select: { id: true, name: true } },
          },
        });
      } else {
        user = await this.prismaService.employee.findUniqueOrThrow({
          where: { tel: identifier },
          include: {
            branch: { select: { id: true, name: true } },
            //role: { select: { id: true, name: true, permissions: true } },
          },
        });
      }

      // Validate user access
      if (!user.hasAccess) {
        throw new ForbiddenException('User account is disabled');
      }

      if (!user.isActive) {
        throw new ForbiddenException('User account is inactive');
      }

      // Validate password
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Generate tokens and return
      const payload = {
        sub: user.id,
        email: user.email,
        lastName: user.lastName,
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
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        gender: user.gender,
        email: user.email,
        tel: user.tel,
        hasAccess: user.hasAccess,
        isActive: user.isActive,
        updatedAt: user.updatedAt,
        createdAt: user.createdAt,
        // role: user.role
        //   ? {
        //       id: user.role.id,
        //       name: user.role.name,
        //       permissions: user.role.permissions,
        //     }
        //   : null,
        branch: user.branch
          ? {
              id: user.branch.id,
              name: user.branch.name,
            }
          : null,
        token: { accessToken, refreshToken },
      };
    } catch (error: unknown) {
      // Handle Prisma not found error
      if (typeof error === 'object' && error !== null && 'code' in error) {
        const err = error as { code?: string };
        if (err.code === 'P2025') {
          throw new NotFoundException('Credentials not found');
        }
      }

      // Re-throw known exceptions
      if (
        error instanceof UnauthorizedException ||
        error instanceof ForbiddenException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      // Log and throw for unknown errors
      console.error('Login error:', error);
      throw new InternalServerErrorException('Authentication error');
    }
  }

  async refreshTokens(userId: string): Promise<IRefreshTokenResponse> {
    try {
      // Check if user still exists and is active
      const user = await this.prismaService.employee.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          hasAccess: true,
          isActive: true,
        },
      });

      if (!user || !user.isActive || !user.hasAccess) {
        throw new ForbiddenException('User no longer active or access revoked');
      }

      // Create new tokens
      const newPayload = {
        sub: user.id,
        email: user.email,
        lastName: user.lastName,
      };

      const newAccessToken = await this.jwtService.signAsync(newPayload, {
        secret:
          this.configService.get<string>('JWT_SECRET') || 'fallback-secret',
        expiresIn: '1d',
      });

      const newRefreshToken = await this.jwtService.signAsync(newPayload, {
        secret:
          this.configService.get<string>('JWT_REFRESH_SECRET') ||
          'fallback-refresh-secret',
        expiresIn: '7d',
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        message: 'Tokens refreshed successfully',
      };
    } catch (error: unknown) {
      const errorName =
        typeof error === 'object' && error !== null && 'name' in error
          ? String((error as { name?: unknown }).name)
          : '';

      if (errorName === 'TokenExpiredError') {
        throw new UnauthorizedException('Refresh token expired');
      } else if (errorName === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid refresh token');
      }
      throw new UnauthorizedException('Token refresh failed');
    }
  }

  // Optional: Method to get current user from token
  async getCurrentUser(userId: string) {
    const user = await this.prismaService.employee.findUnique({
      where: { id: userId, hasAccess: true, isActive: true },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        gender: true,
        hasAccess: true,
        isActive: true,
        //profileImage: true,
        updatedAt: true,
        createdAt: true,
        branch: {
          select: { id: true, name: true },
        },
        // role: {
        //   select: {
        //     id: true,
        //     name: true,
        //     permissions: {
        //       select: {
        //         id: true,
        //         module: true,
        //         name: true,
        //         value: true,
        //         updatedAt: true,
        //         createdAt: true,
        //       },
        //     },
        //   },
        // },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found or inactive');
    }

    if (!user.hasAccess) {
      throw new UnauthorizedException('User account is suspended');
    }

    return user;
  }

  async validateUser(userId: string) {
    try {
      const user = await this.prismaService.employee.findUnique({
        where: { id: userId, isActive: true },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          hasAccess: true,
          isActive: true,
          branchId: true,
          //roleId: true,
          branch: {
            select: {
              id: true,
              name: true,
            },
          },
          // role: {
          //   select: {
          //     id: true,
          //     name: true,
          //     permissions: true,
          //   },
          // },
        },
      });

      if (!user || !user.hasAccess) {
        return null;
      }

      return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        hasAccess: user.hasAccess,
        isActive: user.isActive,
        branch: user.branch || null,
      };
    } catch {
      return null;
    }
  }

  //App Auth
  async appLogin(data: AppLoginDto) {
    const rememberMe = false; // Defaulting to false for app login, can be modified based on requirements
    const accessTokenExpiry = rememberMe ? '7d' : '1d';
    const refreshTokenExpiry = rememberMe ? '30d' : '7d';
    const user = await this.prismaService.client.findUnique({
      where: {
        email: data.email,
      },
    });

    if (!user?.password) {
      throw new UnauthorizedException(
        'Account with no password found. Please reset your password to login',
      );
    }

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isValid = await bcrypt.compare(data.password, user.password);
    console.log(isValid);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      lastName: user.lastName,
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
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phoneNumber: user.phone,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      accessToken,
      refreshToken,
      status: 200,
    };
  }

  async appRegister(data: AppRegisterDto) {
    console.log('data', data);
    try {
      const existingEmail = await this.prismaService.client.findUnique({
        where: {
          email: data.email,
        },
      });

      if (existingEmail) {
        return new BadRequestException(
          'Email is already attached to an account.',
        );
      }

      if (!data.password) {
        throw new BadRequestException('Password is required');
      }

      const parts = data.fullName.trim().split(/\s+/);

      const firstName = parts[0];
      const lastName = parts.length > 1 ? parts[parts.length - 1] : '';

      const hashedPassword = await bcrypt.hash(data.password, 10);

      await this.prismaService.client.create({
        data: {
          email: data.email,
          provider: 'Mobile',
          phone: data.phoneNumber,
          password: hashedPassword,
          fullName: data.fullName,
          firstName: firstName,
          lastName: lastName,
        },
      });

      return {
        status: 'success',
        message: 'Account created successfully. Please login to continue.',
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Failed to register user');
    }
  }

  async sendOtp(data: AppSendOtpDto) {
    const user = await this.prismaService.client.findUnique({
      where: {
        email: data.email,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Generate OTP
    const smsUrl = this.configService.get<string>('SMS_URL');
    const smsSecret = this.configService.get<string>('SMS_SECRET');

    const generateSixDigitPIN = (): string => {
      return Math.floor(100000 + Math.random() * 900000).toString();
    };

    const otp = generateSixDigitPIN();

    const message = `Your ocare otp code is: ${otp}. This code will expire in 10 minutes.`;

    const smsEndpoint = `${smsUrl}/sms/send`;

    // await firstValueFrom(
    //   this.httpService.post(
    //     smsEndpoint,
    //     {
    //       recipients: data.phone,
    //       message: message,
    //     },
    //     {
    //       headers: {
    //         'api-key': smsSecret,
    //         'Content-Type': 'application/json',
    //       },
    //     },
    //   ),
    // );

    // Save OTP to database
    await this.prismaService.clientOtp.create({
      data: {
        clientId: user.id,
        code: otp,
        expiresAt: new Date(Date.now() + 8 * 60 * 1000), // Expires in 8 minutes
      },
    });

    return {
      status: 200,
      data: null,
      message: 'OTP sent successfully',
    };
  }

  async verifyOtp(data: AppVerifyOtpDto) {
    const user = await this.prismaService.client.findUnique({
      where: {
        email: data.email,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const otp = await this.prismaService.clientOtp.findFirst({
      where: {
        clientId: user.id,
      },
    });

    if (!otp) {
      throw new NotFoundException('Invalid OTP or phone number');
    }

    if (otp.code !== data.otp) {
      throw new BadRequestException('Invalid OTP');
    }

    if (otp.expiresAt < new Date()) {
      throw new BadRequestException('OTP has expired');
    }

    // Delete OTP after successful verification
    await this.prismaService.clientOtp.delete({
      where: {
        id: otp.id,
      },
    });

    return {
      status: 200,
      data: null,
      message: 'OTP verified successfully',
    };
  }

  async resetPassword(data: AppLoginDto) {
    try {
      const user = await this.prismaService.client.findUnique({
        where: {
          email: data.email,
        },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);

      await this.prismaService.client.update({
        where: {
          id: user.id,
        },
        data: {
          password: hashedPassword,
        },
      });

      return {
        status: 'success',
        message: 'Password reset successfully. Please login to continue.',
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Failed to reset password');
    }
  }

  async getAppUserProfile(userId: string) {
    const user = await this.prismaService.client.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        firstName: true,
        lastName: true,
        gender: true,
        address: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      status: 200,
      data: user,
      message: 'User profile fetched successfully',
    };
  }

  async updateAppUserPassword(id: string, newPassword: string) {
    const user = await this.prismaService.client.findUnique({
      where: {
        id: id,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prismaService.client.update({
      where: {
        id: id,
      },
      data: {
        password: hashedPassword,
      },
    });

    return {
      status: 200,
      message: 'Password updated successfully',
    };
  }

  async updateAppUserProfile(
    userId: string,
    updateData: Partial<AppRegisterDto>,
  ) {
    const user = await this.prismaService.client.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prismaService.client.update({
      where: {
        id: userId,
      },
      data: updateData,
    });

    return {
      status: 200,
      data: updatedUser,
      message: 'User profile updated successfully',
    };
  }
}
