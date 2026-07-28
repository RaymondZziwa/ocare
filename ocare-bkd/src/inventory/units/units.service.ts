import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GenericResponse } from 'src/utils/genericResponse';

@Injectable()
export class MeasurementUnitService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: { name: string; abr: string }): Promise<GenericResponse> {
    const itemCategory = await this.prismaService.unit.create({ data });
    return {
      status: 200,
      data: itemCategory,
      message: 'Unit created successfully',
    };
  }

  async findAll(): Promise<GenericResponse> {
    const units = await this.prismaService.unit.findMany();
    return {
      status: 200,
      data: units,
      message: 'Units fetched successfully',
    };
  }

  async findOne(id: string): Promise<GenericResponse> {
    const unit = await this.prismaService.unit.findUnique({
      where: { id },
    });
    return {
      status: 200,
      data: unit,
      message: 'Unit fetched successfully',
    };
  }

  async update(
    id: string,
    data: { name?: string; abr?: string },
  ): Promise<GenericResponse> {
    const unit = await this.prismaService.unit.update({
      where: { id },
      data,
    });
    return {
      status: 200,
      data: unit,
      message: 'Unit modified successfully',
    };
  }

  async remove(id: string): Promise<GenericResponse> {
    const unit = await this.prismaService.unit.delete({
      where: { id },
    });
    return {
      status: 200,
      data: unit,
      message: 'Unit deleted successfully',
    };
  }
}
