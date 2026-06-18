import {
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

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
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
            dept: { select: { id: true, name: true } },
            role: { select: { id: true, name: true, permissions: true } },
          },
        });
      } else {
        user = await this.prismaService.employee.findUniqueOrThrow({
          where: { tel: identifier },
          include: {
            branch: { select: { id: true, name: true } },
            dept: { select: { id: true, name: true } },
            role: { select: { id: true, name: true, permissions: true } },
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
        salary: user.salary,
        tel: user.tel,
        hasAccess: user.hasAccess,
        isActive: user.isActive,
        profileImage: user.profileImage || '',
        updatedAt: user.updatedAt,
        createdAt: user.createdAt,
        role: user.role
          ? {
              id: user.role.id,
              name: user.role.name,
              permissions: user.role.permissions,
            }
          : null,
        branch: user.branch
          ? {
              id: user.branch.id,
              name: user.branch.name,
            }
          : null,
        dept: user.dept
          ? {
              id: user.dept.id,
              name: user.dept.name,
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

  async pbdLogin(data: AuthDto): Promise<IUserAuthWithoutPassword> {
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
            dept: { select: { id: true, name: true } },
            role: { select: { id: true, name: true, permissions: true } },
          },
        });
      } else {
        user = await this.prismaService.employee.findUniqueOrThrow({
          where: { tel: identifier },
          include: {
            branch: { select: { id: true, name: true } },
            dept: { select: { id: true, name: true } },
            role: { select: { id: true, name: true, permissions: true } },
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
        salary: user.salary,
        tel: user.tel,
        hasAccess: user.hasAccess,
        isActive: user.isActive,
        profileImage: user.profileImage || '',
        updatedAt: user.updatedAt,
        createdAt: user.createdAt,
        role: user.role
          ? {
              id: user.role.id,
              name: user.role.name,
              permissions: user.role.permissions,
            }
          : null,
        branch: user.branch
          ? {
              id: user.branch.id,
              name: user.branch.name,
            }
          : null,
        dept: user.dept
          ? {
              id: user.dept.id,
              name: user.dept.name,
            }
          : null,
        token: { accessToken, refreshToken },
      };
    } catch (error: unknown) {
      // Handle Prisma not found error
      if (typeof error === 'object' && error !== null && 'code' in error) {
        const err = error as { code?: string };
        if (err.code === 'P2025') {
          console.log(err);
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
        profileImage: true,
        updatedAt: true,
        createdAt: true,
        branch: {
          select: { id: true, name: true },
        },
        dept: {
          select: { id: true, name: true },
        },
        role: {
          select: {
            id: true,
            name: true,
            permissions: {
              select: {
                id: true,
                module: true,
                name: true,
                value: true,
                updatedAt: true,
                createdAt: true,
              },
            },
          },
        },
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
          deptId: true,
          roleId: true,
          branch: {
            select: {
              id: true,
              name: true,
            },
          },
          dept: {
            select: {
              id: true,
              name: true,
            },
          },
          role: {
            select: {
              id: true,
              name: true,
              permissions: true,
            },
          },
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
        branchId: user.branchId,
        deptId: user.deptId,
        roleId: user.roleId,
        branch: user.branch || null,
        dept: user.dept || null,
        role: user.role || null,
      };
    } catch {
      return null;
    }
  }
}
