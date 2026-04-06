import WebSocket from 'ws';

describe('WebSocket Service Delivery', () => {
    let ws: WebSocket;

    beforeAll((done) => {
        ws = new WebSocket('ws://localhost:3004?userId=test_user_99');
        ws.on('open', done);
    });

    afterAll(() => ws.close());

    it('should successfully connect and receive data', (done) => {

        ws.on('message', (data) => {
            const message = JSON.parse(data.toString());
            expect(message.event).toBe('TEST_EVENT');
            done(); 
        });


    });
});