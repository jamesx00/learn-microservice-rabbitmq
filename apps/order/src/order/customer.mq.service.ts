import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class CustomerMqService {
  constructor(@Inject('CUSTOMER_SERVICE') private client: ClientProxy) {}

  async getHello() {
    return this.client.send({ cmd: 'greeting' }, 'Progressive Coder');
  }

  async getHelloAsync() {
    const message = await this.client.send(
      { cmd: 'greeting-async' },
      'Progressive Coder'
    );
    return message;
  }

  async publishEvent(eventName: string, data: any) {
    this.client.emit(eventName, data);
  }
}
