import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSupplierDto, UpdateSupplierDto } from 'src/dto/supplier.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SupplierService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSupplierDto) {
    const supplier = await this.prisma.supplier.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        businessName: dto.businessName,
        email: dto.contact,
        contact: dto.contact,
        address: dto.address,
        type: dto.type,
      },
    });

    return {
      data: supplier,
      message: 'Supplier created successfullly',
      status: 200,
    };
  }

  async findAll() {
    const suppliers = await this.prisma.supplier.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return {
      data: suppliers,
      message: 'Suppliers fetched successfullly',
      status: 200,
    };
  }

  async findOne(id: string) {
    const supplier = await this.prisma.supplier.findUnique({ where: { id } });
    if (!supplier)
      throw new NotFoundException(`Supplier with id ${id} not found`);
    return {
      data: supplier,
      message: 'Supplier fetched successfullly',
      status: 200,
    };
  }

  async update(id: string, dto: UpdateSupplierDto) {
    await this.findOne(id); // ensures it exists
    const supplier = await this.prisma.supplier.update({
      where: { id },
      data: dto,
    });

    return {
      data: supplier,
      message: 'Supplier updated successfullly',
      status: 200,
    };
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.supplier.delete({ where: { id } });

    return {
      data: [],
      message: 'Supplier deleted successfullly',
      status: 200,
    };
  }
}
