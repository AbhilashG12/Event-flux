import { fileURLToPath } from 'url';
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { loggerMiddleware } from './middlewares/logger.js';
import { gatewayRateLimiter } from './middlewares/rateLimiter.js';
import { logger } from "@event-flux/kafka-client/src/logger.js";
import { metricsRouter, httpRequestTimer } from './metrics.js';
import { authMiddleware } from './middlewares/auth.js';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';


import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const swaggerDocument = YAML.load(path.join(__dirname, '../swagger.yaml'));

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(metricsRouter);
app.use(loggerMiddleware); 
app.use((req, res, next) => {
    const end = httpRequestTimer.startTimer();
    res.on('finish', () => {
        end({ 
            method: req.method, 
            route: req.baseUrl || req.path, 
            status_code: res.statusCode 
        });
    });
    next();
});

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
    logger.info({ port: PORT, env: process.env.NODE_ENV }, "🏰 API Gateway started");
});