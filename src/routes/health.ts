import { Router, Request, Response } from 'express';

const router = Router();

// Liveness probe - simple check that the service is running
router.get('/liveness', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
  });
});

// Readiness probe - checks if service is ready to accept traffic
router.get('/readiness', (req: Request, res: Response) => {
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

// Default health endpoint
router.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    memory: {
      used: process.memoryUsage().heapUsed / 1024 / 1024,
      total: process.memoryUsage().heapTotal / 1024 / 1024,
    },
  });
});

export default router;
