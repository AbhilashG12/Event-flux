import { Kafka, Partitioners, logLevel } from "kafkajs";
export const kafka = new Kafka({
    clientId: 'event-flux',
    brokers: ['localhost:9092'],
    logLevel: logLevel.ERROR,
    retry: {
        initialRetryTime: 300,
        retries: 8,
        factor: 2,
    }
});
export const producer = kafka.producer({
    createPartitioner: Partitioners.LegacyPartitioner,
});
export const connectProducer = async () => {
    console.log("⏳ Connecting Kafka Producer...");
    try {
        await producer.connect();
        console.log("✅ Kafka Producer Connected");
    }
    catch (err) {
        console.error("❌ Kafka Connection Error:", err);
    }
};
export const getConsumer = (groupId) => kafka.consumer({ groupId });
export const TOPICS = {
    ORDER_EVENTS: 'order-events',
    PAYMENT_EVENTS: 'payment-events',
    INVENTORY_EVENTS: 'inventory-events',
    NOTIFICATION_EVENTS: 'notification-events',
};
