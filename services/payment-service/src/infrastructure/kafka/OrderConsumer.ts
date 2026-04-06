import { getConsumer, TOPICS } from "@event-flux/kafka-client/src/index.js";

export const startPaymentConsumer = async (useCase: any) => {
  const consumer = getConsumer("payment-group");
  await consumer.connect();
  await consumer.subscribe({ topic: TOPICS.ORDER_EVENTS });

  await consumer.run({

    eachMessage: async ({ message, partition, heartbeat }:any) => {
      try {
        const orderData = JSON.parse(message.value!.toString());
        await useCase.execute(orderData);
      } catch (err) {
        console.error("❌ Processing failed, Kafka will retry...", err);
        throw err; 
      }
    },
  });
};