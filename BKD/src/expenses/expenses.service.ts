import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateBranchExpenseDto,
  UpdateBranchExpenseDto,
} from 'src/dto/expenses.dto';

@Injectable()
export class BranchExpenseService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateBranchExpenseDto) {
    return this.prisma.branchExpense.create({ data: dto });
  }

  async findAll(id: string) {
    const expenses = await this.prisma.branchExpense.findMany({
      where: { branchId: id },
      include: { branch: true, employee: true },
      orderBy: { dateIncurred: 'desc' },
    });

    return {
      status: 200,
      data: expenses,
      message: 'Branch expenses fetched successfully',
    };
  }

  async findOne(id: string) {
    const expense = await this.prisma.branchExpense.findUnique({
      where: { id },
      include: { branch: true, employee: true },
    });
    if (!expense) throw new NotFoundException('Branch expense not found');
    return expense;
  }

  async update(id: string, dto: UpdateBranchExpenseDto) {
    await this.findOne(id); // check existence
    return this.prisma.branchExpense.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id); // check existence
    await this.prisma.branchExpense.delete({ where: { id } });
    return {
      status: 200,
      data: [],
      message: 'Branch expense deleted successfully',
    };
  }
}
