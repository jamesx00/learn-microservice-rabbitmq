import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class CustomerMqService {
  constructor(@Inject('CUSTOMER_SERVICE') private client: ClientProxy) {}

  async sendCommand(command: string, data: any) {
    return this.client.send({ cmd: command }, data);
  }

  async publishEvent(eventName: string, data: any) {
    this.client.emit(eventName, data);
  }
}
