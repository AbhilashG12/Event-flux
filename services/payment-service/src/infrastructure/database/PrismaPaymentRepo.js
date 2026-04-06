import { prisma } from "../../lib/prisma.js";
export class PrismaPaymentRepo {
    async create(paymentData) {
        return await prisma.payment.create({
            data: paymentData
        });
    }
    async findByOrderId(orderId) {
        if (!orderId) {
            console.error("❌ findByOrderId called with undefined ID");
            return null;
        }
        return await prisma.payment.findUnique({
            where: { orderId }
        });
    }
}
