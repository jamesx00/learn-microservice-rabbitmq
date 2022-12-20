import * as chalk from 'chalk';
import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { CustomerModelService } from './customer.model.service';
import { OrderMqService } from './order.mq.service';

@Controller()
export class CustomerMqController {
  constructor(
    private readonly orderMqService: OrderMqService,
    private readonly customerModelService: CustomerModelService
  ) {}

  @MessagePattern({ cmd: 'withdraw-money' })
  withdrawMoney(@Payload() data: { customer: string; amount: number }) {
    const customer = this.customerModelService.findById(data.customer);

    if (!customer) {
      return {
        success: false,
        message: `Could not find customer with the id ${data.customer}`,
      };
    }

    if (customer.money < data.amount) {
      return {
        success: false,
        message: `The customer does not have enough money for this order. Required: ${data.amount}. Available: ${customer.money}`,
      };
    }

    console.log(
      `Withdrawing ${data.amount} from customer ${customer.id}. Original amount: ${customer.money}`
    );
    const updatedCustomer = this.customerModelService.withDrawMoney(
      data.customer,
      data.amount
    );
    console.log(`Customer is left with ${updatedCustomer.money}`);
    return { success: true, message: '', data: updatedCustomer };
  }

  @MessagePattern({ cmd: 'greeting' })
  getGreetingMessage(name: string): string {
    return `Hello ${name}`;
  }

  @EventPattern('order-created')
  async handleOrderCreatedEvent(data: {
    id: number;
    items: string[];
    status: 'PENDING';
    total: number;
    customer: string;
  }) {
    const customer = this.customerModelService.findById(data.customer);
    if (!customer) {
      console.log(
        chalk.redBright(
          `MQ: Emitting event payment-failed for order ${data.id}`
        )
      );
      return this.orderMqService.publishEvent('payment-failed', {
        order: data.id,
        message: `Could not find customer with the id ${data.customer}`,
      });
    }

    if (customer.money < data.total) {
      console.log(
        chalk.redBright(
          `MQ: Emitting event payment-failed for order ${data.id}`
        )
      );
      return this.orderMqService.publishEvent('payment-failed', {
        order: data.id,
        message: `The customer does not have enough money for this order. Required: ${data.total}. Available: ${customer.money}`,
      });
    }

    console.log(
      `Withdrawing ${data.total} from customer ${customer.id}. Original amount: ${customer.money}`
    );
    const updatedCustomer = this.customerModelService.withDrawMoney(
      data.customer,
      data.total
    );
    console.log(`Customer is left with ${updatedCustomer.money}`);

    console.log(
      chalk.greenBright(
        `MQ: Emitting event payment-approved for order ${data.id}`
      )
    );
    return this.orderMqService.publishEvent('payment-approved', {
      order: data.id,
    });
  }
}
