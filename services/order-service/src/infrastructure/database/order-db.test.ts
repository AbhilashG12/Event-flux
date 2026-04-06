import {prisma} from "../../lib/prisma"

describe('Order Database Integration', () => {
    beforeAll(async () => {
        await prisma.order.deleteMany(); 
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    it('should successfully save a pending order to PostgreSQL', async () => {
        const savedOrder = await prisma.order.create({
            data: {
                id: 'test-uuid-1',
                userId: 'test-user',
                amount: 500,
                status: 'PENDING'
            }
        });
        expect(savedOrder.id).toBe('test-uuid-1');
        expect(savedOrder.status).toBe('PENDING');
    });
});