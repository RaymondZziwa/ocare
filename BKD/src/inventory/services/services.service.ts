import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GenericResponse } from 'src/utils/genericResponse';

@Injectable()
export class MservicesService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: {
    name: string;
    price: number;
  }): Promise<GenericResponse> {
    const service = await this.prismaService.service.create({ data });
    return {
      status: 200,
      data: service,
      message: 'Service created successfully',
    };
  }

  async findAll(): Promise<GenericResponse> {
    const services = await this.prismaService.service.findMany();
    return {
      status: 200,
      data: services,
      message: 'Services fetched successfully',
    };
  }

  async findOne(id: number): Promise<GenericResponse> {
    const service = await this.prismaService.service.findUnique({
      where: { id },
    });
    return {
      status: 200,
      data: service,
      message: 'Service fetched successfully',
    };
  }

  async update(
    id: number,
    data: { name?: string; price?: number },
  ): Promise<GenericResponse> {
    const item = await this.prismaService.service.update({
      where: { id },
      data,
    });
    return {
      status: 200,
      data: item,
      message: 'Service modified successfully',
    };
  }

  async remove(id: number): Promise<GenericResponse> {
    const item = await this.prismaService.service.delete({
      where: { id },
    });
    return {
      status: 200,
      data: item,
      message: 'Service deleted successfully',
    };
  }
}
