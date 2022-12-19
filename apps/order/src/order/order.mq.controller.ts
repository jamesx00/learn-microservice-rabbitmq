import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { CustomerMqService } from './customer.mq.service';

@Controller()
export class OrderMqController {
  constructor(private readonly customerMqService: CustomerMqService) {}
  private orders = [];

  @EventPattern('purchase-intent-created')
  async handleOrderCreatedEvent(data: Record<string, unknown>) {
    console.log('A new purchase intent received', data);

    const newOrderId =
      this.orders.length > 0
        ? Math.max.apply(
            null,
            this.orders.map((order) => order.id)
          )
        : 1;

    this.orders.push({ id: newOrderId, items: data });

    console.log('All orders', this.orders);

    return this.customerMqService.publishEvent('order-created', {
      orderId: 1,
      items: ['apple', 'banana', 'cherry'],
    });
  }
}
