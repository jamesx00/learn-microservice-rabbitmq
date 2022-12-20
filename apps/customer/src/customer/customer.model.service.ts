import { Injectable } from '@nestjs/common';

export type Customers = Record<string, CustomerDetail>;

export type CustomerDetail = {
  id: string;
  name: string;
  money: number;
};

@Injectable()
export class CustomerModelService {
  private customers: Customers = {
    '1': {
      id: '1',
      name: 'James',
      money: 1500,
    },
  };
  private lastId = 1;

  getAll(): Customers {
    return this.customers;
  }

  findById(id: string): CustomerDetail {
    return this.customers[id];
  }

  create(): CustomerDetail {
    const newId = (this.lastId + 1).toString();

    const newCustomer = {
      id: newId,
      name: `James ${newId}`,
      money: 500,
    };

    this.customers[newId] = newCustomer;

    this.lastId++;

    return { id: newId, ...newCustomer };
  }

  updateMoney(id: number, amount: number): CustomerDetail {
    this.customers[id].money += amount;
    return this.customers[id];
  }

  withDrawMoney(id: string, amount: number): CustomerDetail {
    this.customers[id].money -= amount;
    return this.customers[id];
  }
}
