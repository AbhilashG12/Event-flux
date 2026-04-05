import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { loggerMiddleware } from './middlewares/logger';
import { gatewayRateLimiter } from './middlewares/rateLimiter';
import { authMiddleware } from './middlewares/auth';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(loggerMiddleware); 
app.use(gatewayRateLimiter); 


app.use('/api/orders', 
    authMiddleware, 
    createProxyMiddleware({ 
        target: 'http://localhost:3001', 
        changeOrigin: true,
        pathRewrite: (path, req) => {
            const expressReq = req as express.Request; 
            return expressReq.originalUrl.replace('/api', ''); 
        },
    })
);

app.use('/api/inventory', 
    createProxyMiddleware({ 
        target: 'http://localhost:3003', 
        changeOrigin: true,
        pathRewrite: (path, req) => {
            const expressReq = req as express.Request;
            return expressReq.originalUrl.replace('/api', ''); 
        },
    })
);

app.listen(PORT, () => {
    console.log(`🏰 API Gateway running on port ${PORT}`);
});