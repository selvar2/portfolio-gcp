import pino from 'pino';
import pinoHttp from 'pino-http';
import { config } from '../config';

// Configure pino logger for Cloud Logging compatibility
const loggerConfig = {
  level: config.logLevel,
  formatters: {
    level: (label: string) => {
      return { severity: label.toUpperCase() };
    },
  },
  timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
  ...(config.nodeEnv === 'development' && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    },
  }),
};

export const logger = pino(loggerConfig);

// HTTP request logger middleware
export const httpLogger = pinoHttp({
  logger,
  autoLogging: {
    ignore: (req) => req.url === '/health' || req.url === '/health/liveness',
  },
  customLogLevel: (_req, res, err) => {
    if (res.statusCode >= 400 && res.statusCode < 500) {
      return 'warn';
    } else if (res.statusCode >= 500 || err) {
      return 'error';
    }
    return 'info';
  },
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      headers: {
        'user-agent': req.headers['user-agent'],
        'content-type': req.headers['content-type'],
      },
      remoteAddress: req.remoteAddress,
      remotePort: req.remotePort,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
      headers: {
        'content-type': typeof res.getHeader === 'function' ? res.getHeader('content-type') : undefined,
        'content-length': typeof res.getHeader === 'function' ? res.getHeader('content-length') : undefined,
      },
    }),
  },
});
