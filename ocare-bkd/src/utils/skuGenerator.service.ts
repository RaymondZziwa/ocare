import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SkuService {
  constructor(private prisma: PrismaService) {}

  async generateSKU(prefix = 'MED') {
    const counter = await this.prisma.sKUCounter.upsert({
      where: {
        prefix,
      },

      update: {
        current: {
          increment: 1,
        },
      },

      create: {
        prefix,
        current: 1,
      },
    });

    return `${prefix}-${counter.current.toString().padStart(6, '0')}`;
  }
}
