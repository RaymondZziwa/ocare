import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Company } from '@prisma/client';

@Injectable()
export class CompanyService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(): Promise<Company | null> {
    return this.prisma.company.findFirst();
  }

  async update(
    id: string,
    data: {
      name?: string;
      email?: string;
      phoneNumbers?: string[];
      address?: string;
      logoPath?: string;
      website?: string;
      tinNumber?: string;
      description?: string;
      workHours?: string;
      foundedYear?: string;
      industry?: string;
      employees?: string;
    },
  ): Promise<Company> {
    const existing = await this.prisma.company.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Company profile not found');

    const updateData: any = { ...data };

    // Handle phone numbers
    if (data.phoneNumbers) {
      updateData.tel1 = data.phoneNumbers[0] || existing.tel1;
      updateData.tel2 = data.phoneNumbers[1] || null;
      delete updateData.phoneNumbers;
    }

    if (data.workHours) {
      updateData.workHours = parseFloat(data.workHours);
    }

    // Handle logo path
    if (data.logoPath !== undefined) {
      updateData.logo = data.logoPath;
      delete updateData.logoPath;
    }

    // Handle foundedYear conversion
    if (data.foundedYear !== undefined) {
      updateData.foundedYear = data.foundedYear
        ? parseInt(data.foundedYear, 10)
        : null;
      delete updateData.foundedYearString;
    }

    return this.prisma.company.update({
      where: { id },
      data: updateData,
    });
  }
}
