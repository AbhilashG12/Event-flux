import { ProcessPaymentUseCase } from './ProcessPayment.js';
import { prisma } from '../../lib/prisma.js';
import { producer } from '@event-flux/kafka-client/src/index.js';
jest.mock('../../infrastructure/database/prisma', () => ({
    prisma: {
        processedEvent: { findUnique: jest.fn(), create: jest.fn() },
        payment: { create: jest.fn() },
        $transaction: jest.fn(),
    }
}));
jest.mock('@event-flux/kafka-client', () => ({
    producer: { send: jest.fn() },
    TOPICS: { PAYMENT_EVENTS: 'payment-events' },
    createEvent: jest.fn().mockReturnValue({ eventId: 'mock-event', payload: {} })
}));
describe('ProcessPaymentUseCase', () => {
    const useCase = new ProcessPaymentUseCase();
    const mockOrder = { id: 'order-123', amount: 250, userId: 'user-1' };
    beforeEach(() => jest.clearAllMocks());
    it('should skip processing if the event is already in the idempotency table', async () => {
        prisma.processedEvent.findUnique.mockResolvedValue({ eventId: 'duplicate-event' });
        await useCase.execute(mockOrder, 'duplicate-event');
        expect(prisma.$transaction).not.toHaveBeenCalled();
        expect(producer.send).not.toHaveBeenCalled();
    });
    it('should process a successful payment and fire Kafka event', async () => {
        prisma.processedEvent.findUnique.mockResolvedValue(null);
        await useCase.execute(mockOrder, 'new-event');
        expect(prisma.$transaction).toHaveBeenCalled();
        expect(producer.send).toHaveBeenCalled();
    });
});
