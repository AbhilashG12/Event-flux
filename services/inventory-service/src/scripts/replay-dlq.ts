import { kafka } from '@event-flux/kafka-client';

async function replayEvents() {
    const consumer = kafka.consumer({ groupId: 'dlq-replay-group-v1' });
    const producer = kafka.producer();

    await consumer.connect();
    await producer.connect();
    await consumer.subscribe({ topic: 'dead-letter-topic', fromBeginning: true });

    console.log('♻️ Listening to DLQ for messages to replay...');

    await consumer.run({
        eachMessage: async ({ message }) => {
            try {

                const originalTopic = message.headers?.originalTopic?.toString();
                
                if (!originalTopic) {
                    console.log('⚠️ Message in DLQ missing originalTopic header. Skipping.');
                    return;
                }

                console.log(`➡️ Replaying message back to ${originalTopic}...`);
                await producer.send({
                    topic: originalTopic,
                    messages: [{
                        key: message.key,
                        value: message.value,
                    }]
                });
                
            } catch (err) {
                console.error('Failed to replay message:', err);
            }
        }
    });
}

replayEvents().catch(console.error);