import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GenericResponse } from 'src/utils/genericResponse';

@Injectable()
export class BatchService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(): Promise<GenericResponse> {
    const batches = await this.prismaService.batch.findMany({
      include: {
        item: true,
        brand: true,
      },
    });
    return {
      status: 200,
      data: batches,
      message: 'Batches fetched successfully',
    };
  }

  async findOne(id: string): Promise<GenericResponse> {
    const batch = await this.prismaService.batch.findUnique({
      where: { id },
    });
    return {
      status: 200,
      data: batch,
      message: 'Batch fetched successfully',
    };
  }

  async update(
    id: string,
    data: {
      number: string;
      buyingPrice: number;
      sellingPrice: number;
      wholesalePrice: number;
      expiryDate: Date;
      itemId: string;
      brandId: string;
    },
  ): Promise<GenericResponse> {
    const batch = await this.prismaService.batch.update({
      where: { id },
      data: {
        itemId: data.itemId,
        brandId: data.brandId,
        number: data.number,
        expiryDate: data.expiryDate,
        buyingPrice: data.buyingPrice,
        sellingPrice: data.sellingPrice,
        wholesalePrice: data.wholesalePrice,
      },
    });

    return {
      status: 200,
      data: batch,
      message: 'Batch modified successfully',
    };
  }

  async remove(id: string): Promise<GenericResponse> {
    const batch = await this.prismaService.batch.delete({
      where: { id },
    });
    return {
      status: 200,
      data: batch,
      message: 'Batch deleted successfully',
    };
  }
}
