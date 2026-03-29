import {Request,Response} from "express";
import { CreateOrder } from "../../application/use-cases/CreateOrder";
import { PrismaOrderRepository } from "../../infrastructure/database/OrderRepoImpl";


const repo = new PrismaOrderRepository();
const useCase = new CreateOrder(repo);


export class OrderController {
    static async create(req:Request,res:Response){
        const {userId,amount} = req.body;
        const order = await useCase.execute(userId,amount);
        res.status(201).json(order);
    }
}