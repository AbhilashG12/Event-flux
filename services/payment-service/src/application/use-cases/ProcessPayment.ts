import { producer, TOPICS } from "@event-flux/kafka-client";

export class ProcessPaymentUseCase {
  async execute(orderData: any) { 
    console.log(`💳 Processing Order: ${orderData.id}`);
    const isSuccess = orderData.amount < 5000; 
    const event = {
      orderId: orderData.id,
      status: isSuccess ? "PAYMENT_SUCCESS" : "PAYMENT_FAILED",
    };
    await producer.send({
      topic: TOPICS.PAYMENT_EVENTS,
      messages: [{ value: JSON.stringify(event) }],
    });
  }
}