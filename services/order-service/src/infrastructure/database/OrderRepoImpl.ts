import { prisma } from "../../lib/prisma.js";
import { OrderRepo } from "../../domain/repos/OrderRepo.js";
import { Order } from "../../domain/entities/Order.js";

export class PrismaOrderRepository implements OrderRepo {
  async save(order: Order): Promise<void> {
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

  async findById(id: string): Promise<Order | null> {
    const data = await prisma.order.findUnique({ where: { id: id } });
    if (!data) return null;
    return new Order(data.id, data.userId, data.amount, data.status as any, data.createdAt);
  }
}