import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GenericResponse } from 'src/utils/genericResponse';

@Injectable()
export class StoreService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: {
    branchId: string;
    deptId: string;
    name: string;
    authorizedPersonnel: number[];
  }): Promise<GenericResponse> {
    const store = await this.prismaService.store.create({ data });
    return {
      status: 200,
      data: store,
      message: 'Store created successfully',
    };
  }

  async findAll(branchId: string): Promise<GenericResponse> {
    const stores = await this.prismaService.store.findMany({
      where: {
        branchId: branchId,
      },
      include: {
        branch: true,
        dept: true,
      },
    });
    return {
      status: 200,
      data: stores,
      message: 'Stores fetched successfully',
    };
  }

  async findOne(id: string): Promise<GenericResponse> {
    const store = await this.prismaService.store.findUnique({
      where: { id },
      include: {
        branch: true,
        dept: true,
      },
    });
    return {
      status: 200,
      data: store,
      message: 'Store fetched successfully',
    };
  }

  async update(
    id: string,
    data: {
      branchId?: string;
      deptId?: string;
      name?: string;
      authorizedPersonnel: number[];
    },
  ): Promise<GenericResponse> {
    const store = await this.prismaService.store.update({
      where: { id },
      data,
    });
    return {
      status: 200,
      data: store,
      message: 'Store modified successfully',
    };
  }

  async remove(id: string): Promise<GenericResponse> {
    const store = await this.prismaService.store.delete({
      where: { id },
    });
    return {
      status: 200,
      data: store,
      message: 'Store deleted successfully',
    };
  }

  async toggleStore(id: string, branchId: string): Promise<GenericResponse> {
    const store = await this.prismaService.store.findUnique({
      where: { id, branchId },
    });

    await this.prismaService.store.updateMany({
      data: {
        isForSales: false,
      },
    });

    await this.prismaService.store.update({
      where: {
        id: store?.id,
      },
      data: {
        isForSales: true,
      },
    });

    return {
      status: 200,
      data: store,
      message: 'Store toggled successfully',
    };
  }
}
