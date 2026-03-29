import { Order } from "../entities/Order";

export interface OrderRepo {
    save(order:Order):Promise<void>;
    findById(id:string):Promise<Order|null>;
}