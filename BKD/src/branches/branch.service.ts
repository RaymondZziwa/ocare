import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GenericResponse } from 'src/utils/genericResponse';

@Injectable()
export class BranchService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: {
    name: string;
    location: string;
  }): Promise<GenericResponse> {
    const branch = await this.prismaService.branch.create({ data });
    return {
      status: 200,
      data: branch,
      message: 'Branch created successfully',
    };
  }

  async findAll(): Promise<GenericResponse> {
    const branches = await this.prismaService.branch.findMany();
    return {
      status: 200,
      data: branches,
      message: 'Branches fetched successfully',
    };
  }

  async findOne(id: string): Promise<GenericResponse> {
    const branch = await this.prismaService.branch.findUnique({
      where: { id },
    });
    return {
      status: 200,
      data: branch,
      message: 'Branches fetched successfully',
    };
  }

  async update(
    id: string,
    data: { name?: string; location?: string },
  ): Promise<GenericResponse> {
    const branch = await this.prismaService.branch.update({
      where: { id },
      data,
    });
    return {
      status: 200,
      data: branch,
      message: 'Branch modified successfully',
    };
  }

  async remove(id: string): Promise<GenericResponse> {
    const branch = await this.prismaService.branch.delete({ where: { id } });
    return {
      status: 200,
      data: branch,
      message: 'Branch deleted successfully',
    };
  }
}
