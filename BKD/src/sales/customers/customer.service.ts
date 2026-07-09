import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateClientDto,
  reviewPrescriptionDto,
  UpdateClientDto,
} from 'src/dto/client.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ClientService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateClientDto) {
    const client = await this.prisma.client.create({
      data: {
        ...dto,
        fullName: `${dto.firstName} ${dto.lastName}`,
      },
    });

    return {
      data: client,
      message: 'Client created successfullly',
      status: 200,
    };
  }

  async findAll() {
    const clients = await this.prisma.client.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return {
      data: clients,
      message: 'Clients fetched successfullly',
      status: 200,
    };
  }

  async findOne(id: string) {
    const client = await this.prisma.client.findUnique({ where: { id } });
    if (!client) throw new NotFoundException(`Client with id ${id} not found`);
    return {
      data: client,
      message: 'Client fetched successfullly',
      status: 200,
    };
  }

  async update(id: string, dto: UpdateClientDto) {
    await this.findOne(id); // ensures it exists
    const client = await this.prisma.client.update({
      where: { id },
      data: dto,
    });

    return {
      data: client,
      message: 'Client updated successfullly',
      status: 200,
    };
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.client.delete({ where: { id } });

    return {
      data: [],
      message: 'Client deleted successfullly',
      status: 200,
    };
  }

  async getClientPurchases(id: string) {
    await this.findOne(id);
    const posPurchases = await this.prisma.sale.findMany({
      where: {
        clientId: id,
      },
      include: {
        store: true,
        employee: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      message: 'Client purchases retrieved successfully',
      data: {
        purchases: posPurchases,
      },
      status: 200,
    };
  }

  async uploadPrescriptionImages(
    clientId: string,
    files: Express.Multer.File[],
    dto: { notes: string; prescribedBy: string },
  ) {
    if (!files || files.length === 0) {
      throw new NotFoundException('No files uploaded');
    }

    // ✅ Verify client exists
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    // ✅ Map file paths for JSON storage
    const imagePaths = files.map(
      (file) => `/uploads/prescription/${file.filename}`,
    );

    // ✅ Save new prescription record
    const prescription = await this.prisma.clientPrescription.create({
      data: {
        clientId,
        images: imagePaths,
        notes: dto.notes,
        prescribedBy: dto.prescribedBy,
      },
    });

    return {
      message: 'Prescription images uploaded successfully',
      count: files.length,
      images: imagePaths,
      prescription,
    };
  }

  async getPrescriptions(clientId: string) {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    // ✅ Create Record
    const prescriptions = await this.prisma.clientPrescription.findMany({
      where: {
        clientId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      message: 'Prescriptions fetched successfully',
      data: prescriptions,
      status: 200,
    };
  }

  async prescriptionHistory(id: string, startDate?: string, endDate?: string) {
    const employee = await this.prisma.employee.findUnique({ where: { id } });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    // Adjust end date to include the entire day
    let end: Date | undefined = undefined;
    if (endDate) {
      end = new Date(endDate);
      end.setDate(end.getDate() + 1); // include the whole end day
    }

    const prescriptions = await this.prisma.clientPrescription.findMany({
      where: {
        prescribedBy: id,
        ...(startDate || end
          ? {
              createdAt: {
                ...(startDate && { gte: new Date(startDate) }),
                ...(end && { lt: end }),
              },
            }
          : {}),
      },
      include: {
        employee: { select: { firstName: true, lastName: true } },
        client: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      message: 'Prescriptions fetched successfully',
      data: prescriptions,
      status: 200,
    };
  }

  async allPrescriptionHistory(startDate?: string, endDate?: string) {
    // Adjust end date to include the entire day
    let end: Date | undefined = undefined;
    if (endDate) {
      end = new Date(endDate);
      end.setDate(end.getDate() + 1); // include the whole end day
    }

    const prescriptions = await this.prisma.clientPrescription.findMany({
      where: {
        ...(startDate || end
          ? {
              createdAt: {
                ...(startDate && { gte: new Date(startDate) }),
                ...(end && { lt: end }),
              },
            }
          : {}),
      },
      include: {
        employee: { select: { firstName: true, lastName: true } },
        client: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      message: 'Prescriptions fetched successfully',
      data: prescriptions,
      status: 200,
    };
  }

  async reviewPescription(id: string, dto: reviewPrescriptionDto) {
    const prescription = await this.prisma.clientPrescription.findUnique({
      where: { id },
    });

    if (!prescription) {
      throw new NotFoundException('Prescription not found');
    }

    const updatedPrescription = await this.prisma.clientPrescription.update({
      where: { id },
      data: { reviewNotes: dto.reviewNotes, isReviewed: true },
    });

    return {
      message: 'Prescription reviewed successfully',
      data: updatedPrescription,
      status: 200,
    };
  }
}
