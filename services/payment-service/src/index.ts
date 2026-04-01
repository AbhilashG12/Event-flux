
import "dotenv/config";
import express from 'express';
import { connectProducer, getConsumer, TOPICS } from "@event-flux/kafka-client";

async function bootstrap() {
    const app = express();
    app.use(express.json());

    await connectProducer();
    const consumer = getConsumer("payment-group");
    await consumer.connect();
    await consumer.subscribe({ topic: TOPICS.ORDER_EVENTS, fromBeginning: false });

    await consumer.run({
        eachMessage: async ({ message }) => {
            const rawData = message.value?.toString();
            if (!rawData) return;

            const order = JSON.parse(rawData);
            console.log(`💳 [Payment Service] Received Order: ${order.id} for $${order.amount}`);
            
       
        }
    });

    app.listen(3002, () => {
        console.log("💳 Payment Service listening on port 3002");
    });
}

bootstrap().catch(console.error);