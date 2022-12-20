import * as chalk from 'chalk';
import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { OrderModelService } from './order.model.service';

@Controller()
export class OrderMqController {
  constructor(private readonly orderModelService: OrderModelService) {}

  @EventPattern('payment-approved')
  async confirmOrder(data: { order: string }) {
    console.log(chalk.greenBright(`MQ: A payment approved event received`));
    this.orderModelService.confirm(data.order);
    console.log(
      `Set the order id ${data.order} to ${chalk.greenBright('CONFIRMED')}`
    );
  }

  @EventPattern('payment-failed')
  async rejectOrder(data: { order: string; message: string }) {
    console.log(
      chalk.yellowBright(
        `MQ: A payment-failed event received. Reason: ${data.message}`
      )
    );
    this.orderModelService.delete(data.order);
    console.log(chalk.redBright(`Removed order ${data.order}`));
  }
}
