import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GenericResponse } from 'src/utils/genericResponse';

@Injectable()
export class BrandService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: { name: string }): Promise<GenericResponse> {
    // Include barcode in creation data
    const brand = await this.prismaService.brand.create({
      data: {
        ...data,
      },
    });

    return {
      status: 200,
      data: brand,
      message: 'Brand created successfully',
    };
  }

  async findAll(): Promise<GenericResponse> {
    const brands = await this.prismaService.brand.findMany();
    return {
      status: 200,
      data: brands,
      message: 'Brands fetched successfully',
    };
  }

  async findOne(id: string): Promise<GenericResponse> {
    const brand = await this.prismaService.brand.findUnique({
      where: { id },
    });
    return {
      status: 200,
      data: brand,
      message: 'Brand fetched successfully',
    };
  }

  async update(
    id: string,
    data: {
      name: string;
    },
  ): Promise<GenericResponse> {
    const brand = await this.prismaService.brand.update({
      where: { id },
      data: {
        name: data.name,
      },
    });

    return {
      status: 200,
      data: brand,
      message: 'Brand modified successfully',
    };
  }

  async remove(id: string): Promise<GenericResponse> {
    const brand = await this.prismaService.brand.delete({
      where: { id },
    });
    return {
      status: 200,
      data: brand,
      message: 'Brand deleted successfully',
    };
  }

  async findByName(name: string) {
    if (!name) return null;
    const upper = name.toUpperCase();
    return this.prismaService.brand.findFirst({
      where: {
        name: {
          equals: upper,
        },
      },
    });
  }

  async findById(id: string) {
    return this.prismaService.brand.findUnique({ where: { id } });
  }
}
