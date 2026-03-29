
import {Kafka,Partitioners,Producer,Consumer} from "kafkajs";

const kafka = new Kafka({
    clientId : "event-flux",
    brokers : ["localhost:9092"]
})

export const producer : Producer = kafka.producer({
    createPartitioner : Partitioners.LegacyPartitioner,
})

export const getConsumer = (groupId:string) : Consumer => kafka.consumer({groupId});

export const TOPICS = {
  ORDER_EVENTS: 'order-events',
  PAYMENT_EVENTS: 'payment-events',
  INVENTORY_EVENTS: 'inventory-events',
  NOTIFICATION_EVENTS: 'notification-events',
} as const;