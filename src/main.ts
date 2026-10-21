import { config } from 'dotenv';
process.env.TZ = 'Asia/Manila';
config({ path: ['.env'] });

import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: false }),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalFilters(new HttpExceptionFilter());

  const httpPort = Number(process.env.PORT) || 5024;
  const tcpPort = Number(process.env.TCP_PORT) || 5025;

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: tcpPort,
    },
  });

  try {
    await app.startAllMicroservices();
  } catch (error: unknown) {
    console.warn(
      `Warning: Failed to start microservice TCP transport: ${(error as Error)?.message}`,
    );
  }

  await app.listen(httpPort);
  console.log(`Reference Microservice running on HTTP port ${httpPort} and TCP port ${tcpPort}`);
}

bootstrap();
