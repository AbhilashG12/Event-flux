import { prisma } from "../../lib/prisma.js";
import { Order } from "../../domain/entities/Order.js";
export class PrismaOrderRepository {
    async save(order) {
        await prisma.order.create({
            data: {
                id: order.id,
                userId: order.userId,
                amount: order.amount,
                status: order.status,
                createdAt: order.createdAt
            }
        });
    }
    async findById(id) {
        const data = await prisma.order.findUnique({ where: { id: id } });
        if (!data)
            return null;
        return new Order(data.id, data.userId, data.amount, data.status, data.createdAt);
    }
}
