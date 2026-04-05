import { producer, TOPICS } from "@event-flux/kafka-client";
import { createEvent } from "packages/kafka-client/src/eventBuilder.js";
import { PrismaPaymentRepo } from "../../infrastructure/database/PrismaPaymentRepo.js";

export class ProcessPaymentUseCase {
    private repo = new PrismaPaymentRepo();

    async execute(orderData: { id: string; amount: number; userId: string }) {
        if (!orderData.id) {
            console.error("❌ ProcessPaymentUseCase: Missing Order ID");
            return;
        }

        const existingPayment = await this.repo.findByOrderId(orderData.id);
        if (existingPayment) {
            console.log(`⚠️ Order ${orderData.id} already processed. Skipping...`);
            return;
        }

        console.log(`💳 Processing payment for Order: ${orderData.id} ($${orderData.amount})`);
        
        const isSuccess = orderData.amount < 5000;
        
        await this.repo.create({
            orderId: orderData.id,
            amount: orderData.amount,
            status: isSuccess ? "COMPLETED" : "FAILED"
        });

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