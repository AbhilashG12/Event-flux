import { prisma } from "../../lib/prisma.js"

export class PrismaPaymentRepo {
  async create(paymentData: { orderId: string; amount: number; status: string }) {
    return await prisma.payment.create({
      data: paymentData
    });
  }

  async findByOrderId(orderId: string) {
    if (!orderId) {
        console.error("❌ findByOrderId called with undefined ID");
        return null;
    }

    return await prisma.payment.findUnique({
        where: { orderId }
    });
}
}