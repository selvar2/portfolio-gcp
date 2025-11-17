import { Router, Request, Response } from 'express';

const router = Router();

// Liveness probe - simple check that the service is running
router.get('/liveness', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'alive' });
});

// Readiness probe - checks if service is ready to accept traffic
router.get('/readiness', (_req: Request, res: Response) => {
  // Add checks for dependencies here (database, external services, etc.)
  const isReady = true; // Add actual health checks

  if (isReady) {
    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString(),
      checks: {
        database: 'ok',
        storage: 'ok',
      },
    });
  } else {
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
    });
  }
});

// Detailed health check
router.get('/', (_req: Request, res: Response) => {
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();

  res.status(200).json({
    status: 'healthy',
    uptime: Math.floor(uptime),
    timestamp: new Date().toISOString(),
    memory: {
      used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
    },
  });
});

export default router;
