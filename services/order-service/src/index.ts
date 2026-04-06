import express from 'express';
import { OrderController } from './interfaces/controller/OrderController';
import {logger} from "@event-flux/kafka-client/src/logger"

const app = express();
app.use(express.json());

app.post('/orders', OrderController.create);
app.get("/orders/:id" , OrderController.getById);

app.listen(3001, () => logger.info('🛒 Order Service on port 3001'));