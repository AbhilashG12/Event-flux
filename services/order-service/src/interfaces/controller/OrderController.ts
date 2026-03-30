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

    
    static async getById(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const order = await repo.findById(id as string);
        if (!order) return res.status(404).json({ error: "Order not found" });
        return res.status(200).json(order);
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
}