import { Controller, Get, Post } from '@nestjs/common';

import { CustomerMqService } from './customer.mq.service';
import { OrderModelService } from './order.model.service';

@Controller()
export class OrderHttpController {
  constructor(
    private readonly customerMqService: CustomerMqService,
    private readonly orderModelService: OrderModelService
  ) {}

  @Post('orders')
  async create() {
    const order = await this.orderModelService.create();
    this.customerMqService.publishEvent('order-created', order);
    return order;
  }

  @Get('orders')
  async get() {
    return this.orderModelService.getAll();
  }
}
