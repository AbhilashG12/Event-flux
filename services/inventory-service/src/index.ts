import express from 'express';
import { kafka, producer, TOPICS } from '@event-flux/kafka-client';
import { createEvent } from 'packages/kafka-client/src/eventBuilder.js';
import { prisma } from './lib/prisma.js';

const app = express();
app.use(express.json());

const DEFAULT_PRODUCT_ID = 'PROD_1';
const DEFAULT_QTY = 1;
const consumer = kafka.consumer({ groupId: 'inventory-group' });

const startServer = async () => {
    try {
        await producer.connect();
        await consumer.connect();
        
        await consumer.subscribe({ topic: TOPICS.PAYMENT_EVENTS, fromBeginning: true });

        console.log('📦 Inventory Service connected to Kafka');

        await consumer.run({
            eachMessage: async ({ topic, partition, message }: any) => {
                try {
                    if (!message.value) return;
                    
                    const parsedEvent = JSON.parse(message.value.toString());
                    const type = parsedEvent.type;
                    const data = parsedEvent.payload;

                    if (type === 'PAYMENT_SUCCESS') {
                        const existing = await prisma.reservation.findUnique({ where: { orderId: data.orderId } });
                        if (existing) {
                            console.log(`⚠️ Idempotency: Reservation already exists for Order ${data.orderId}`);
                            return;
                        }

                        await prisma.$transaction([
                            prisma.product.update({
                                where: { id: DEFAULT_PRODUCT_ID },
                                data: { stock: { decrement: DEFAULT_QTY } }
                            }),
                            prisma.reservation.create({
                                data: {
                                    orderId: data.orderId,
                                    productId: DEFAULT_PRODUCT_ID,
                                    quantity: DEFAULT_QTY,
                                    status: 'RESERVED'
                                }
                            })
                        ]);

                        console.log(`📦 Reserved ${DEFAULT_QTY} stock for Order: ${data.orderId}`);

                        const inventoryEvent = createEvent('INVENTORY_RESERVED', {
                            orderId: data.orderId,
                            userId: data.userId
                        });

                        await producer.send({
                            topic: TOPICS.INVENTORY_EVENTS,
                            messages: [{ 
                                key: data.orderId,
                                value: JSON.stringify(inventoryEvent) 
                            }]
                        });
                    }

                    if (type === 'PAYMENT_FAILED') {
                        const reservation = await prisma.reservation.findUnique({ where: { orderId: data.orderId } });
                        
                        if (!reservation || reservation.status === 'COMPENSATED') {
                            console.log(`ℹ️ Ignored failed payment for ${data.orderId} (No stock was reserved)`);
                            return;
                        }

                        await prisma.$transaction([
                            prisma.product.update({
                                where: { id: DEFAULT_PRODUCT_ID },
                                data: { stock: { increment: reservation.quantity } }
                            }),
                            prisma.reservation.update({
                                where: { orderId: data.orderId },
                                data: { status: 'COMPENSATED' }
                            })
                        ]);

                        console.log(`🔄 Rolled back stock for Failed Order: ${data.orderId}`);
                    }
                } catch (error: any) {
                    console.error(`🚨 Poison Pill Caught! Sending to DLQ. Error: ${error.message}`);
                    await producer.send({
                        topic: 'dead-letter-topic',
                        messages: [{
                            key: message.key,
                            value: message.value,
                            headers: {
                                originalTopic: topic,
                                errorMessage: error.message || 'Unknown processing error',
                                failedAt: new Date().toISOString()
                            }
                        }]
                    });
                }
            },
        });

        const existingProduct = await prisma.product.findUnique({ 
            where: { id: DEFAULT_PRODUCT_ID } 
        });
        
        if (!existingProduct) {
            await prisma.product.create({
                data: { id: DEFAULT_PRODUCT_ID, stock: 100 }
            });
            console.log(`🌱 Seeded default product: ${DEFAULT_PRODUCT_ID} with 100 stock`);
        }

        app.listen(3003, () => console.log('📦 Inventory Service listening on port 3003'));
    } catch (error) {
        console.error('❌ Error starting Inventory Service:', error);
    }
};

startServer();