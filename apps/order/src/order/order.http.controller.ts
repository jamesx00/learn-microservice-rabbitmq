import * as chalk from 'chalk';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { CustomerHttpService } from './customer.http.service';

import { CustomerMqService } from './customer.mq.service';
import { OrderModelService } from './order.model.service';

@Controller('orders')
export class OrderHttpController {
  constructor(
    private readonly customerHttpService: CustomerHttpService,
    private readonly customerMqService: CustomerMqService,
    private readonly orderModelService: OrderModelService
  ) {}

  @Post('new-order-rabbitmq-event-based')
  async createWithEvent(@Body() body: { customer: string }) {
    const order = this.createNewOrder(body.customer);
    console.log(`Emitting an order-created event with order id ${order.id}`);
    this.customerMqService.publishEvent('order-created', order);
    return order;
  }

  private createNewOrder(customer: string) {
    console.log('Start creating a new order with HTTP');
    const order = this.orderModelService.create(customer);
    console.log(`Created ${chalk.blue('PENDING')} order ${order.id}`);
    return order;
  }

  @Post('new-order-rabbitmq-request-response')
  async createWithRabbitMqRequestResponse(@Body() body: { customer: string }) {
    const order = this.createNewOrder(body.customer);

    console.log(`Checking if customer ${body.customer} has enough money`);

    const result = await this.customerMqService.sendCommand('withdraw-money', {
      customer: body.customer,
      amount: 1000,
    });

    result.subscribe((result: { success: boolean; message: string }) => {
      if (result.success) {
        console.log(
          `Successfully withdrew ${order.total} from customer ${body.customer}`
        );
        this.orderModelService.confirm(order.id.toString());
        console.log(
          `Confirmed order ${order.id}. Set status to ${chalk.greenBright(
            'CONFIRMED'
          )}`
        );
      } else {
        console.log(chalk.yellowBright(result.message));
        this.orderModelService.delete(order.id.toString());
        console.log(chalk.redBright(`Removed order ${order.id}`));
      }
    });

    console.log(chalk.gray('SYS: Return order create result to client'));

    return { message: `Order ${order.id} received` };
  }

  @Post('new-order-sync-http')
  async createWithHttp(@Body() body: { customer: string }) {
    const order = this.createNewOrder(body.customer);

    console.log(`Checking if customer ${body.customer} has enough money`);

    try {
      const response = await this.customerHttpService.withdrawCustomerMoney(
        body.customer,
        order.total
      );
      if (response.status === 200) {
        console.log(
          `Successfully withdrew ${order.total} from customer ${body.customer}`
        );
        const updatedOrder = this.orderModelService.confirm(
          order.id.toString()
        );
        console.log(
          `Confirmed order ${order.id}. Set status to ${chalk.greenBright(
            'CONFIRMED'
          )}`
        );
        return updatedOrder;
      }
    } catch (err) {
      console.log(chalk.yellowBright(err.response.data.message));
      await this.orderModelService.delete(order.id.toString());
      console.log(chalk.redBright(`Removed order ${order.id}`));
      throw new BadRequestException(err.response.data.message);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.findOrderByIdOrNotFound(id);
  }

  @Get()
  async get() {
    return this.orderModelService.getAll();
  }

  private findOrderByIdOrNotFound(id: string) {
    const order = this.orderModelService.findById(id);
    if (!order) {
      throw new NotFoundException(`Order not found with the id ${id}`);
    }

    return order;
  }
}
