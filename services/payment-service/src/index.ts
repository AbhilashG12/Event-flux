
import "dotenv/config";
import express from 'express';
import { connectProducer, getConsumer, TOPICS } from "@event-flux/kafka-client";
import { ProcessPaymentUseCase } from "./application/use-cases/ProcessPayment";

const processPayment = new ProcessPaymentUseCase();

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

        const outerEnvelope = JSON.parse(rawData);
        const orderInfo = outerEnvelope.data;

        if (orderInfo) {
            await processPayment.execute({
                id: orderInfo.id, 
                amount: orderInfo.amount
            });
        } else {
            console.error("❌ Received message with missing 'data' property");
        }
    },
});

    app.listen(3002, () => {
        console.log("💳 Payment Service listening on port 3002");
    });
}

bootstrap().catch(console.error);