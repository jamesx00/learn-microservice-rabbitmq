import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CustomerHttpController } from './customer.http.controller';
import { CustomerModelService } from './customer.model.service';

import { CustomerMqController } from './customer.mq.controller';
import { OrderMqService } from './order.mq.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'ORDER_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'order_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  controllers: [CustomerMqController, CustomerHttpController],
  providers: [OrderMqService, CustomerModelService],
})
export class CustomerModule {}
