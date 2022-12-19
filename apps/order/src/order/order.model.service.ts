import { Injectable } from '@nestjs/common';

export type Order = {
  id: number;
  items: string[];
};

@Injectable()
export class OrderModelService {
  private orders: Order[] = [];

  async getAll(): Promise<Order[]> {
    return this.orders;
  }

  async create(): Promise<Order> {
    const maxId = this.getMaxOrderId();

    const newOrder = {
      id: maxId + 1,
      items: ['apple', 'banana', 'cherry'],
    };

    this.orders.push(newOrder);
    return newOrder;
  }

  private getMaxOrderId() {
    return this.orders.length > 0
      ? Math.max.apply(
          null,
          this.orders.map((order) => order.id)
        )
      : 0;
  }
}
