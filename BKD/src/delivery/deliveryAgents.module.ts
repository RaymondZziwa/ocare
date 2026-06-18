import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { DeliveryAgentController } from './deliveryAgents.controller';
import { DeliveryAgentService } from './deliveryAgents.service';
import { DeliveryAreaService } from './areas.service';
import { DeliveryAreaController } from './areas.controller';

@Module({
  controllers: [DeliveryAreaController, DeliveryAgentController],
  providers: [DeliveryAreaService, DeliveryAgentService, PrismaService],
})
export class DeliveryAgentModule {}
