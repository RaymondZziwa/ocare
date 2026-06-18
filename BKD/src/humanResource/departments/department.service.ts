import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateDepartmentDto,
  UpdateDepartmentDto,
} from 'src/dto/humanResource.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DepartmentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDepartmentDto) {
    await this.prisma.department.create({
      data: {
        name: dto.name,
        branchId: dto.branchId,
      },
    });
    return {
      status: 201,
      data: [],
      message: 'Department saved successfully',
    };
  }

  async findAll() {
    const depts = await this.prisma.department.findMany({
      include: {
        branch: true,
        Employee: true,
        Store: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      status: 200,
      data: depts,
      message: 'Departments fetched successfully',
    };
  }

  async findOne(id: string) {
    const department = await this.prisma.department.findUnique({
      where: { id },
      include: { branch: true, Employee: true, Store: true },
    });

    if (!department) {
      throw new NotFoundException(`Department with id ${id} not found`);
    }
    return department;
  }

  async update(id: string, dto: UpdateDepartmentDto) {
    await this.findOne(id); // ensures it exists
    await this.prisma.department.update({
      where: { id },
      data: dto,
    });
    return {
      status: 201,
      data: [],
      message: 'Department modified successfully',
    };
  }

  async remove(id: string) {
    await this.findOne(id); // ensures it exists
    await this.prisma.department.delete({ where: { id } });
    return {
      status: 201,
      data: [],
      message: 'Department deleted successfully',
    };
  }
}
