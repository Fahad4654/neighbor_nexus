import client from 'prom-client';
import { Request, Response, NextFunction } from 'express';

// 1. Setup the registry and default metrics
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// 2. Define custom metrics for HTTP traffic
// Using string literals for metric names to avoid the TypeScript error
const METRIC_NAME_DURATION = 'http_request_duration_seconds';
const METRIC_NAME_TOTAL = 'http_requests_total';

const httpRequestDurationMicroseconds = new client.Histogram({
  name: METRIC_NAME_DURATION,
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.003, 0.03, 0.1, 0.3, 1.5, 10], // Buckets for response time (latency)
});
register.registerMetric(httpRequestDurationMicroseconds);

// 3. Simple Counter for total requests
const httpRequestsTotal = new client.Counter({
    name: METRIC_NAME_TOTAL,
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'code'],
});
register.registerMetric(httpRequestsTotal);

// Middleware to track request duration and count
export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // Start a timer for response duration tracking
    const end = httpRequestDurationMicroseconds.startTimer();
    
    res.on('finish', () => {
        // Determine the route path (use req.path if req.route is undefined)
        const route = req.route ? req.route.path : req.path;
        
        // Record labels for both metrics
        const labels = {
            method: req.method,
            route: route,
            code: res.statusCode,
        };

        // Increment the total requests counter
        httpRequestsTotal.inc(labels);

        // Stop the timer and record the response duration
        end(labels);
    });
    next();
};

// Route handler to expose metrics
export const metricsRoute = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.set('Content-Type', register.contentType);
        res.end(await register.metrics());
    } catch (error) {
        console.error("Error generating metrics:", error);
        res.status(500).end("Error generating metrics");
    }
};
