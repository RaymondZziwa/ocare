import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GenericResponse } from 'src/utils/genericResponse';
import { DeliveryAreaDto } from 'src/dto/deliveryArea.dto';

@Injectable()
export class DeliveryAreaService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: DeliveryAreaDto): Promise<GenericResponse> {
    const area = await this.prismaService.deliveryAreas.create({ data });
    return {
      status: 200,
      data: area,
      message: 'Delivery area created successfully',
    };
  }

  async findAll(): Promise<GenericResponse> {
    const areas = await this.prismaService.deliveryAreas.findMany();
    return {
      status: 200,
      data: areas,
      message: 'Delivery areas fetched successfully',
    };
  }

  async findOne(id: string): Promise<GenericResponse> {
    const area = await this.prismaService.deliveryAreas.findUnique({
      where: { id },
    });
    return {
      status: 200,
      data: area,
      message: 'Delivery area fetched successfully',
    };
  }

  async update(id: string, data: DeliveryAreaDto): Promise<GenericResponse> {
    const area = await this.prismaService.deliveryAreas.update({
      where: { id },
      data,
    });
    return {
      status: 200,
      data: area,
      message: 'Delivery area modified successfully',
    };
  }

  async remove(id: string): Promise<GenericResponse> {
    const area = await this.prismaService.deliveryAreas.delete({
      where: { id },
    });
    return {
      status: 200,
      data: area,
      message: 'Delivery area deleted successfully',
    };
  }
}
