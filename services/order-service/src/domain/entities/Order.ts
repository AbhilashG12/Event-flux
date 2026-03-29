import { OrderStatus } from '@event-flux/types';

export class Order {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly amount: number,
    public status: OrderStatus,
    public readonly createdAt: Date
  ) {}

  static create(userId: string, amount: number): Order {
    return new Order(
      crypto.randomUUID(),
      userId,
      amount,
      OrderStatus.CREATED,
      new Date()
    );
  }
}