import { Order } from "../../domain/entities/Order";
import { OrderRepo } from "../../domain/repos/OrderRepo";
import { TOPICS, producer } from "@event-flux/kafka-client/src/index";
import { createEvent } from "@event-flux/kafka-client/src/eventBuilder";

export class CreateOrder {
    constructor(private orderRepo: OrderRepo) {}

    async execute(userId: string, amount: number) {
        const order = Order.create(userId, amount);

        await this.orderRepo.save(order);

        const standardizedEvent = createEvent('ORDER_CREATED', {
            orderId: order.id,
            userId: order.userId,
            amount: order.amount
        });

        await producer.connect();
        await producer.send({
            topic: TOPICS.ORDER_EVENTS,
            messages: [{
                key: order.id,
                value: JSON.stringify(standardizedEvent)
            }]
        });

        return order;
    }
}