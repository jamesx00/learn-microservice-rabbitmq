import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { CustomerModelService } from './customer.model.service';

@Controller('customers')
export class CustomerHttpController {
  constructor(private customerModelService: CustomerModelService) {}

  @Get()
  async get() {
    return this.customerModelService.getAll();
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.findCustomerByIdOrNotFound(id);
  }

  @Post()
  async create() {
    return this.customerModelService.create();
  }

  @Post(':id/add-money')
  async updateMoney(@Param('id') id: string) {
    this.findCustomerByIdOrNotFound(id);
    return this.customerModelService.updateMoney(parseInt(id), 500);
  }

  @HttpCode(HttpStatus.OK)
  @Post(':id/withdraw-money')
  async withdrawMoney(
    @Param('id') id: string,
    @Body() body: { amount: number }
  ) {
    const customer = this.findCustomerByIdOrNotFound(id);

    if (customer.money < body.amount) {
      throw new BadRequestException(
        `The customer does not have enough money for this order. Required: ${body.amount}. Available: ${customer.money}`
      );
    }

    console.log(
      `Withdrawing ${body.amount} from customer ${customer.id}. Original amount: ${customer.money}`
    );
    const updatedCustomer = this.customerModelService.withDrawMoney(
      id,
      body.amount
    );
    console.log(`Customer is left with ${updatedCustomer.money}`);
    return updatedCustomer;
  }

  private findCustomerByIdOrNotFound(id: string) {
    const customer = this.customerModelService.findById(id);

    if (!customer) {
      throw new NotFoundException(`Customer not found with the id ${id}`);
    }

    return customer;
  }
}
