import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface Config {
  nodeEnv: string;
  port: number;
  logLevel: string;
  gcp: {
    projectId: string;
    region: string;
    bucketName: string;
  };
  allowedOrigins: string[];
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  cache: {
    maxAge: number;
    cdnMaxAge: number;
  };
  contact: {
    email: string;
    recaptchaSecret?: string;
  };
}

const parseOrigins = (origins: string | undefined): string[] => {
  if (!origins) return ['*'];
  return origins.split(',').map((origin) => origin.trim());
};

export const config: Config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '8080', 10),
  logLevel: process.env.LOG_LEVEL || 'info',
  gcp: {
    projectId: process.env.GCP_PROJECT_ID || '',
    region: process.env.GCP_REGION || 'us-central1',
    bucketName: process.env.GCS_BUCKET_NAME || '',
  },
  allowedOrigins: parseOrigins(process.env.ALLOWED_ORIGINS),
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
  cache: {
    maxAge: parseInt(process.env.CACHE_CONTROL_MAX_AGE || '3600', 10),
    cdnMaxAge: parseInt(process.env.CDN_CACHE_MAX_AGE || '86400', 10),
  },
  contact: {
    email: process.env.CONTACT_EMAIL || '',
    recaptchaSecret: process.env.RECAPTCHA_SECRET_KEY,
  },
};
