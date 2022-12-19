import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { OrderHttpController } from './order.http.controller';
import { OrderMqController } from './order.mq.controller';
import { CustomerMqService } from './customer.mq.service';
import { OrderModelService } from './order.model.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'CUSTOMER_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'customer_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],

  controllers: [OrderHttpController, OrderMqController],
  providers: [CustomerMqService, OrderModelService],
})
export class OrderModule {}
