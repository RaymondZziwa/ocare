import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BranchUtilityService {
  constructor(private readonly prisma: PrismaService) {}

  async payLightToken() {}
  async payWaterBill() {}
}
