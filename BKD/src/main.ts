import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import 'dotenv/config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(cookieParser());

  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5170',
      'http://localhost:8080',
      'https://ocareportal.netlify.app',
      'https://pbms.megaerpug.com',
      'http://localhost:8081',
      'https://pbdp.megaerpug.com',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Authorization, X-Requested-With',
  });

  await app.listen(3500);
}
bootstrap();
