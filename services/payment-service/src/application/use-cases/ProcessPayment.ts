import { producer, TOPICS } from "@event-flux/kafka-client";
import { PrismaPaymentRepo } from "../../infrastructure/database/PrismaPaymentRepo.js";

export class ProcessPaymentUseCase {
  private repo = new PrismaPaymentRepo();

  async execute(orderData: { id: string; amount: number }) {
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
    await producer.send({
      topic: TOPICS.PAYMENT_EVENTS,
      messages: [{ 
        value: JSON.stringify({
          orderId: orderData.id,
          event: isSuccess ? "PAYMENT_SUCCESS" : "PAYMENT_FAILED",
          data : {
            orderId : orderData.id,
          }
        }) 
      }],
    });

    console.log(`Payment ${isSuccess ? "Success" : "Failed"} for ${orderData.id}`);
  }
}