import axios from 'axios';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CustomerHttpService {
  async withdrawCustomerMoney(id: string, amount: number) {
    const response = await axios.post(
      `http://localhost:8000/customers/${id}/withdraw-money`,
      {
        amount: amount,
      }
    );
    return response;
  }
}
