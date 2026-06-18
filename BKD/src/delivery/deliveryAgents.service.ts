import { Injectable } from '@nestjs/common';
import { DeliveryAgentDto } from 'src/dto/deliveryAgent.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { GenericResponse } from 'src/utils/genericResponse';

@Injectable()
export class DeliveryAgentService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: DeliveryAgentDto): Promise<GenericResponse> {
    const agent = await this.prismaService.deliveryAgents.create({ data });
    return {
      status: 200,
      data: agent,
      message: 'Agent created successfully',
    };
  }

  async findAll(): Promise<GenericResponse> {
    const agents = await this.prismaService.deliveryAgents.findMany();
    return {
      status: 200,
      data: agents,
      message: 'Agents fetched successfully',
    };
  }

  async findOne(id: string): Promise<GenericResponse> {
    const agent = await this.prismaService.deliveryAgents.findUnique({
      where: { id },
    });
    return {
      status: 200,
      data: agent,
      message: 'Agent fetched successfully',
    };
  }

  async update(id: string, data: DeliveryAgentDto): Promise<GenericResponse> {
    const agent = await this.prismaService.deliveryAgents.update({
      where: { id },
      data,
    });
    return {
      status: 200,
      data: agent,
      message: 'Agent modified successfully',
    };
  }

  async remove(id: string): Promise<GenericResponse> {
    const agent = await this.prismaService.deliveryAgents.delete({
      where: { id },
    });
    return {
      status: 200,
      data: agent,
      message: 'Agent deleted successfully',
    };
  }
}
