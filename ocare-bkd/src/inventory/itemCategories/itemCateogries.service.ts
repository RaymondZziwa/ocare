import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GenericResponse } from 'src/utils/genericResponse';

@Injectable()
export class ItemCategoryService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: {
    name: string;
    code: string;
    description?: string;
  }): Promise<GenericResponse> {
    const itemCategory = await this.prismaService.itemCategory.create({ data });
    return {
      status: 200,
      data: itemCategory,
      message: 'Item Category created successfully',
    };
  }

  async findAll(): Promise<GenericResponse> {
    const itemCategories = await this.prismaService.itemCategory.findMany();
    return {
      status: 200,
      data: itemCategories,
      message: 'Item categories fetched successfully',
    };
  }

  async findOne(id: string): Promise<GenericResponse> {
    const itemCategory = await this.prismaService.itemCategory.findUnique({
      where: { id },
    });
    return {
      status: 200,
      data: itemCategory,
      message: 'Item category fetched successfully',
    };
  }

  async update(id: string, data: { name?: string }): Promise<GenericResponse> {
    const itemCategory = await this.prismaService.itemCategory.update({
      where: { id },
      data,
    });
    return {
      status: 200,
      data: itemCategory,
      message: 'Item category modified successfully',
    };
  }

  async remove(id: string): Promise<GenericResponse> {
    const itemCategory = await this.prismaService.itemCategory.delete({
      where: { id },
    });
    return {
      status: 200,
      data: itemCategory,
      message: 'Item category deleted successfully',
    };
  }
}
