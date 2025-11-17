import request from 'supertest';
import { app } from '../app';

describe('Health Endpoints', () => {
  describe('GET /health', () => {
    it('should return 200 and health status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('memory');
    });
  });

  describe('GET /health/liveness', () => {
    it('should return 200 and alive status', async () => {
      const response = await request(app).get('/health/liveness');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'alive');
    });
  });

  describe('GET /health/readiness', () => {
    it('should return 200 and ready status', async () => {
      const response = await request(app).get('/health/readiness');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ready');
      expect(response.body).toHaveProperty('checks');
    });
  });
});

describe('Root Endpoint', () => {
  describe('GET /', () => {
    it('should return API information', async () => {
      const response = await request(app).get('/');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('status', 'running');
      expect(response.body).toHaveProperty('endpoints');
    });
  });
});

describe('404 Handler', () => {
  it('should return 404 for non-existent routes', async () => {
    const response = await request(app).get('/non-existent-route');

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'Not Found');
  });
});
