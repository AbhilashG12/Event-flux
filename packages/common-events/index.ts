import {z} from "zod";

export const orderCreatedSchema = z.object({
    orderid : z.string(),
    userId : z.string(),
    amount : z.number(),
    items : z.array(z.string()),
    timestamp : z.string().datetime(),

})

export type  orderCreatedEvent = z.infer<typeof orderCreatedSchema>;

export enum EventTopics {
  ORDER_CREATED = 'order.created',
  PAYMENT_PROCESSED = 'payment.processed',
  INVENTORY_RESERVED = 'inventory.reserved',
  ORDER_COMPLETED = 'order.completed'
}