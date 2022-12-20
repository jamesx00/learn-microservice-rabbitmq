/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import { CustomerModule } from './customer/customer.module';

async function bootstrap() {
  const app = await NestFactory.create(CustomerModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://localhost:5672'],
      queue: 'customer_queue',
      // noAck: false,
      queueOptions: {
        durable: false,
      },
    },
  });

  const globalPrefix = '';
  app.setGlobalPrefix(globalPrefix);
  const port = process.env.PORT || 8000;

  await app.startAllMicroservices();
  await app.listen(port);

  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
