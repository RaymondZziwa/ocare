// stock-movement.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateDeliveryNoteDto } from 'src/dto/stockMovement.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DeliveryNoteService {
  constructor(private prisma: PrismaService) {}

  async create(files: Express.Multer.File[], dto: CreateDeliveryNoteDto) {
    const imagePaths = files.map((file) => `/uploads/dns/${file.filename}`);

    await this.prisma.deliveryNote.create({
      data: {
        deliveryNoteNumber: dto.deliveryNoteNumber,
        images: imagePaths,
        name: dto.name,
        notes: dto.notes,
        registeredBy: dto.registeredBy,
      },
    });

    return {
      status: 200,
      message: 'Delivery note saved successfully',
    };
  }

  async getAllDeliveryNotes() {
    try {
      const dns = await this.prisma.deliveryNote.findMany({
        include: {
          employee: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          InventoryRecord: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return {
        status: 200,
        message: 'Delivery notes fetched successfully',
        data: dns,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async deleteDeliveryNotes(id: string) {
    try {
      const dns = await this.prisma.deliveryNote.delete({
        where: {
          id,
        },
      });

      return {
        status: 200,
        message: 'Delivery note deleted successfully',
        data: dns,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
