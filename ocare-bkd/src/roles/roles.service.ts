import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRoleDto, UpdateRoleDto } from 'src/dto/roles.dto';
import { GenericResponse } from 'src/utils/genericResponse';

@Injectable()
export class RoleService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateRoleDto): Promise<GenericResponse> {
    const { name, permissions } = data;
    try {
      await this.prisma.role.create({
        data: {
          name,
          permissions: {
            connect: permissions.map((value) => ({ value })),
          },
        },
      });
      return {
        status: 200,
        data: [],
        message: 'Role created successfully',
      };
    } catch (error) {
      throw new ForbiddenException(
        'Role creation failed. Please ensure the new role name is unique',
      );
    }
  }

  async findAll(): Promise<GenericResponse> {
    const roles = await this.prisma.role.findMany({
      include: {
        Employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        permissions: true,
      },
    });

    return {
      status: 200,
      data: roles,
      message: 'Roles fetched successfully',
    };
  }

  // async findOne(id: number): Promise<GenericResponse> {
  //   const role = await this.prisma.role.findUnique({ where: { id } });
  //   return {
  //     status: 200,
  //     data: role,
  //     message: 'Role fetched successfully',
  //   };
  // }

  async update(id: string, data: UpdateRoleDto): Promise<GenericResponse> {
    await this.prisma.role.update({
      where: { id },
      data: {
        name: data.name,
        permissions: {
          set: data.permissions.map((value) => ({ value })),
        },
      },
    });

    return {
      status: 200,
      data: [],
      message: 'Role updated successfully',
    };
  }

  async remove(id: string): Promise<GenericResponse> {
    await this.prisma.role.delete({ where: { id } });
    return {
      status: 200,
      data: [],
      message: 'Role deleted successfully',
    };
  }

  async getAllPermissions(): Promise<GenericResponse> {
    const permissions = await this.prisma.permission.findMany({
      select: {
        id: true,
        name: true,
        value: true,
        module: true,
      },
      orderBy: { module: 'asc' },
    });

    // Group by category
    const grouped = permissions.reduce(
      (acc, perm) => {
        const { module, ...rest } = perm;
        if (!acc[module]) {
          acc[module] = [];
        }
        acc[module].push(rest);
        return acc;
      },
      {} as Record<string, any[]>,
    );

    // Transform into array format
    const perms = Object.entries(grouped).map(([module, perms]) => ({
      module,
      permissions: perms,
    }));

    return {
      status: 200,
      data: perms,
      message: 'Permissions fetched successfully',
    };
  }
}
