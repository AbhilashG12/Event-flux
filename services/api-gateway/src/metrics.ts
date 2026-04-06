import client from 'prom-client';
import express from 'express';

const register = new client.Registry();
client.collectDefaultMetrics({ register });

export const httpRequestTimer = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5]
});

register.registerMetric(httpRequestTimer);

export const metricsRouter = express.Router();
metricsRouter.get('/metrics', async (req, res) => {
  res.setHeader('Content-Type', register.contentType);
  res.send(await register.metrics());
});