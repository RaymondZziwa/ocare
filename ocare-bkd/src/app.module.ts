import { Module } from '@nestjs/common';
import { WebAppModule } from './web-app/webApp.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes ConfigService available everywhere without re-importing
    }),
    WebAppModule,
  ],
})
export class AppModule {}
