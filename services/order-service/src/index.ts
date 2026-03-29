import express from 'express';
import { OrderController } from './interfaces/controller/OrderController';

const app = express();
app.use(express.json());

app.post('/orders', OrderController.create);

app.listen(3001, () => console.log('🛒 Order Service on port 3001'));