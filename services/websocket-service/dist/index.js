import express from "express";
import { WebSocket, WebSocketServer } from "ws";
import Redis from "ioredis";
import { kafka, TOPICS } from "@event-flux/kafka-client/src/index.js";
import "dotenv/config";
const app = express();
const PORT = process.env.PORT || 3004;
const sub = new Redis(process.env.REDIS_URL);
const pub = new Redis(process.env.REDIS_URL);
const clients = new Map();
const server = app.listen(PORT, () => {
    console.log("WebSocket service listening to ", PORT);
});
const wss = new WebSocketServer({ server });
wss.on("connection", (ws, req) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const userId = url.searchParams.get("userId");
    if (!userId) {
        ws.close(1008, "UserId is required");
        return;
    }
    clients.set(userId, ws);
    console.log(`User id connected : ${userId}. Active Local connections:${clients.size}`);
    ws.on("close", () => {
        clients.delete(userId);
        console.log(`User disconnected : ${userId}`);
    });
});
sub.subscribe("ws-notification");
sub.on("message", (channel, message) => {
    if (channel == "ws-notification") {
        const { userId, event, payload } = JSON.parse(message);
        const userSocket = clients.get(userId);
        if (userSocket && userSocket.readyState == WebSocket.OPEN) {
            userSocket.send(JSON.stringify({ type: event, data: payload }));
            console.log(`Pushed [${event}] to ${userId}`);
        }
    }
});
const startKafkaListener = async () => {
    const wsConsumer = kafka.consumer({ groupId: "websocket-group-v2" });
    await wsConsumer.connect();
    await wsConsumer.subscribe({ topic: TOPICS.ORDER_EVENTS, fromBeginning: true });
    await wsConsumer.subscribe({ topic: TOPICS.PAYMENT_EVENTS, fromBeginning: true });
    await wsConsumer.subscribe({ topic: TOPICS.INVENTORY_EVENTS, fromBeginning: true });
    console.log('🎧 WebSocket Service listening to Kafka topics...');
    await wsConsumer.run({
        eachMessage: async ({ topic, message }) => {
            if (!message.value)
                return;
            const parsedMessage = JSON.parse(message.value.toString());
            const eventType = parsedMessage.type;
            const userId = parsedMessage.payload?.userId;
            console.log(`[KAFKA IN] Topic: ${topic} | Event: ${eventType} | UserID: ${userId}`);
            if (userId) {
                pub.publish('ws-notification', JSON.stringify({
                    userId: userId,
                    event: eventType,
                    payload: parsedMessage.payload
                }));
            }
            else {
                console.log(`❌ IGNORING [${eventType}]: No userId found in payload!`);
            }
        }
    });
};
startKafkaListener().catch(console.error);
