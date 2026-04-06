import http from 'k6/http';
import { check, sleep } from 'k6';
export const options = {
    stages: [
        { duration: '10s', target: 100 },
        { duration: '30s', target: 1000 },
        { duration: '10s', target: 0 },
    ],
};
export default function () {
    const url = 'http://localhost:3000/api/orders';
    const token = 'YOUR_VALID_JWT_TOKEN_HERE';
    const payload = JSON.stringify({
        userId: 'load_test_user',
        amount: Math.floor(Math.random() * 500) + 10
    });
    const params = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    };
    const response = http.post(url, payload, params);
    check(response, {
        'is status 201': (r) => r.status === 201,
        'transaction time < 500ms': (r) => r.timings.duration < 500,
    });
    sleep(1);
}
