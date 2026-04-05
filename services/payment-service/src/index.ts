
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
            eachMessage: async ({ message }: any) => {
                if (!message.value) return;
                
                const parsedEvent = JSON.parse(message.value.toString());
            
                const type = parsedEvent.type; 
                const data = parsedEvent.payload; 

                if (!data) {
                    console.error("❌ Received message with missing 'payload' property");
                    return;
                }

                if (type === 'ORDER_CREATED') { 
                    const { orderId, amount, userId } = data;
                    
                    await processPayment.execute({ 
                        id: orderId, 
                        amount, 
                        userId 
                    });
                }
            }
        });

    app.listen(3002, () => {
        console.log("💳 Payment Service listening on port 3002");
    });
}

bootstrap().catch(console.error);