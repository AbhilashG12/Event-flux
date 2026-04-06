import { Kafka, Producer, Consumer } from "kafkajs";
export declare const kafka: Kafka;
export declare const producer: Producer;
export declare const connectProducer: () => Promise<void>;
export declare const getConsumer: (groupId: string) => Consumer;
export declare const TOPICS: {
    readonly ORDER_EVENTS: "order-events";
    readonly PAYMENT_EVENTS: "payment-events";
    readonly INVENTORY_EVENTS: "inventory-events";
    readonly NOTIFICATION_EVENTS: "notification-events";
};
