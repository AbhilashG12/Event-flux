import express from 'express';
import { kafka, producer, TOPICS } from '@event-flux/kafka-client';
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
            eachMessage: async ({ message }: any) => {
                if (!message.value) return;
                const { event, data } = JSON.parse(message.value.toString());
                if (event === 'PAYMENT_SUCCESS') {
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

                    await producer.send({
                        topic: TOPICS.INVENTORY_EVENTS,
                        messages: [{ value: JSON.stringify({ event: 'INVENTORY_RESERVED', data : {orderId: data.orderId,userId:data.userId} }) }]
                    });
                }

                if (event === 'PAYMENT_FAILED') {
                    const reservation = await prisma.reservation.findUnique({ where: { orderId: data.orderId } });
                    
                    if (!reservation || reservation.status === 'COMPENSATED') {
                        console.log(`ℹ️ Ignored failed payment for ${data.orderId} (No stock was reserved)`);
                        return;
                    }

                    if (reservation.status === 'COMPENSATED') {
                        console.log(`⚠️ Idempotency: Stock already rolled back for ${data.orderId}`);
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
            },
        });

        app.listen(3003, () => console.log('📦 Inventory Service listening on port 3003'));
    } catch (error) {
        console.error('❌ Error starting Inventory Service:', error);
    }
};

startServer();