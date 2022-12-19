import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import { OrderMqService } from './order.mq.service';

@Controller()
export class CustomerMqController {
  constructor(private readonly orderMqService: OrderMqService) {}

  private customers = [{ id: 1, name: 'John' }];

  @MessagePattern({ cmd: 'get-customer-details' })
  getGreetingMessage(id: number) {
    return this.customers.find((customer) => customer.id === id);
  }

  @EventPattern('order-created')
  async handleOrderCreatedEvent(data: Record<string, unknown>) {
    console.log('A new order created ', data);
  }
}
