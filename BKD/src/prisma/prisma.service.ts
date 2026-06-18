import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { env } from 'process';
//import { removeSensitiveFields } from './sensitizeResponse';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    super({
      datasources: {
        db: {
          url: env.DATABASE_URL,
        },
      },
    });

    // Apply the extension
    //this.$extends(removeSensitiveFields);
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
