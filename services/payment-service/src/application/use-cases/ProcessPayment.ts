import { producer, TOPICS } from "@event-flux/kafka-client";
import { createEvent } from "packages/kafka-client/src/eventBuilder.js";
import {prisma} from "../../lib/prisma"

export class ProcessPaymentUseCase {
    async execute(orderData: { id: string; amount: number; userId: string }, eventId: string) {
        if (!orderData.id) {
            console.error("❌ ProcessPaymentUseCase: Missing Order ID");
            return;
        }

        const processed = await prisma.processedEvent.findUnique({
            where: { eventId: eventId }
        });

        if (processed) {
            console.log(`⚠️ Idempotency: Event ${eventId} already processed. Skipping...`);
            return;
        }

        console.log(`💳 Processing payment for Order: ${orderData.id} ($${orderData.amount})`);
        
        const isSuccess = orderData.amount < 5000;

        try {
            await prisma.$transaction([
                prisma.payment.create({
                    data: {
                        orderId: orderData.id,
                        amount: orderData.amount,
                        status: isSuccess ? "COMPLETED" : "FAILED"
                    }
                }),
                prisma.processedEvent.create({
                    data: {
                        eventId: eventId,
                        serviceName: "payment-service"
                    }
                })
            ]);
        } catch (error: any) {
            if (error.code === 'P2002') {
                console.log(`⚠️ Idempotency: Concurrent duplicate event blocked for ${eventId}.`);
                return;
            }
            throw error;
        }

        const paymentEvent = createEvent(
            isSuccess ? "PAYMENT_SUCCESS" : "PAYMENT_FAILED", 
            {
                orderId: orderData.id,
                userId: orderData.userId,
            }
        );

        await producer.send({
            topic: TOPICS.PAYMENT_EVENTS,
            messages: [{
                key: orderData.id,
                value: JSON.stringify(paymentEvent)
            }],
        });

        console.log(`Payment ${isSuccess ? "Success" : "Failed"} for ${orderData.id}`);
    }
}