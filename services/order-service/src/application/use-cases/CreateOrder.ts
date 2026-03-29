import { Order } from "../../domain/entities/Order";
import { OrderRepo } from "../../domain/repos/OrderRepo";
import { TOPICS,producer } from "@event-flux/kafka-client";

export class CreateOrder {
    constructor(private orderRepo : OrderRepo){}

    async execute(userId:string,amount:number){
        const order = Order.create(userId,amount);

        await this.orderRepo.save(order);

        await producer.connect();
        await producer.send({
            topic : TOPICS.ORDER_EVENTS,
            messages : [{
                value : JSON.stringify({event : "ORDER_CREATED" , data : order})
            }]
        })

        return order;
    }

}