import { v4 as uuidv4 } from "uuid";
export const loggerMiddleware = (req, res, next) => {
    const traceId = uuidv4();
    req.headers['x-trace-id'] = traceId;
    console.log(`[${new Date().toISOString()}] [Trace: ${traceId}] ${req.method} ${req.originalUrl}`);
    next();
};
