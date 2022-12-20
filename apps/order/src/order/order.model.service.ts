import { Injectable } from '@nestjs/common';

export type Orders = Record<string, OrderDetail>;

export type OrderDetail = {
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  id: string;
  items: string[];
  total: number;
  customer: string;
};

@Injectable()
export class OrderModelService {
  private orders: Orders = {
    '1': {
      status: 'PENDING',
      id: '1',
      total: 1000,
      items: ['apple', 'banana', 'cherry'],
      customer: '1',
    },
  };
  private lastId = 1;

  getAll(): Orders {
    return this.orders;
  }

  findById(id: string): OrderDetail {
    return this.orders[id];
  }

  create(customer: string): OrderDetail {
    const newId = (this.lastId + 1).toString();

    const newOrder = {
      id: newId,
      items: ['apple', 'banana', 'cherry'],
      status: 'PENDING' as const,
      total: 1000,
      customer: customer,
    };

    this.orders[newId] = newOrder;

    this.lastId++;

    return newOrder;
  }

  cancel(id: string) {
    this.orders[id].status = 'CANCELLED';
    return this.orders[id];
  }

  confirm(id: string) {
    this.orders[id].status = 'CONFIRMED';
    return this.orders[id];
  }

  delete(id: string): void {
    delete this.orders[id];
  }

  private getMaxOrderId() {
    const ids = Object.keys(this.orders);
    return ids.length > 0 ? Math.max.apply(null, ids) : 0;
  }
}
