import http, { Response } from 'k6/http';
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
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJsb2FkX3Rlc3RfdXNlciIsImlhdCI6MTc3NTQ1MjEzMywiZXhwIjoxNzc1NTM4NTMzfQ.pbDQo3fn9_dDg8qPJJRxuY6_uy_nXveq8bISenumxYY'; 

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
        'is status 201': (r: Response) => r.status === 201,
        'transaction time < 500ms': (r: Response) => r.timings.duration < 500, 
    });

    sleep(1); 
}