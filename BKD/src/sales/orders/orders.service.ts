import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateClientDto } from 'src/dto/client.dto';
import { CreateSaleDto } from 'src/dto/pos.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AppOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateClientDto) {
    const client = await this.prisma.client.create({
      data: dto,
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
  async completeOrder(id: string) {
    const order = await this.prisma.sale.findUnique({
      where: {
        id,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order not found`);
    }

    await this.prisma.sale.update({
      where: {
        id,
      },
      data: {
        saleStatus: 'SUCCESSFUL',
      },
    });

    return {
      message: 'Order status updated successfully',
      data: [],
      status: 200,
    };
  }
  async assignDeliveryAget() {}
  async updateOrderStatus() {}
  async cancelOrder() {}

  async placeAppOrder(data: CreateSaleDto) {
    const {
      customerId,
      servedBy,
      storeId,
      items,
      paymentMethods,
      notes,
      total,
      totalWithCharges,
      balance,
      status,
      phoneNumber,
    } = data;
  }

  async appPendingOrders() {
    const orders = await this.prisma.sale.findMany({
      where: {
        type: 'APP',
        saleStatus: {
          in: ['PENDING'],
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        employee: true,
        store: true,
        client: true,
      },
    });

    return {
      message: 'Pending orders fetched successfully',
      data: orders,
      status: 200,
    };
  }

  async appOrderHistory() {
    const orders = await this.prisma.sale.findMany({
      where: {
        type: 'APP',
        saleStatus: {
          not: 'PENDING', // Exclude pending status
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        employee: true,
        store: true,
        client: true,
      },
    });

    return {
      message: 'App order history fetched successfully',
      data: orders,
      status: 200,
    };
  }
}
