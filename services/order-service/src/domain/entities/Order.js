import { OrderStatus } from '@event-flux/types';
export class Order {
    id;
    userId;
    amount;
    status;
    createdAt;
    constructor(id, userId, amount, status, createdAt) {
        this.id = id;
        this.userId = userId;
        this.amount = amount;
        this.status = status;
        this.createdAt = createdAt;
    }
    static create(userId, amount) {
        return new Order(crypto.randomUUID(), userId, amount, OrderStatus.CREATED, new Date());
    }
}
