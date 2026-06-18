import { IsString } from 'class-validator';

export class DeliveryAgentDto {
  @IsString()
  firstName!: string;
  @IsString()
  lastName!: string;
  @IsString()
  licensePlate?: string;
}
