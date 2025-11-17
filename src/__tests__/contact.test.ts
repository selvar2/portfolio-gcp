import request from 'supertest';
import { app } from '../app';

describe('Contact Form Endpoint', () => {
  describe('POST /api/contact', () => {
    const validContactData = {
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'Test Subject',
      message: 'This is a test message with sufficient length.',
    };

    it('should accept valid contact form submission', async () => {
      const response = await request(app).post('/api/contact').send(validContactData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
    });

    it('should reject submission without name', async () => {
      const invalidData: Partial<typeof validContactData> = { ...validContactData };
      delete invalidData.name;

      const response = await request(app).post('/api/contact').send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
      expect(Array.isArray(response.body.errors)).toBe(true);
    });

    it('should reject submission with invalid email', async () => {
      const invalidData = {
        ...validContactData,
        email: 'invalid-email',
      };

      const response = await request(app).post('/api/contact').send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    it('should reject submission with short subject', async () => {
      const invalidData = {
        ...validContactData,
        subject: 'Hi',
      };

      const response = await request(app).post('/api/contact').send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    it('should reject submission with short message', async () => {
      const invalidData = {
        ...validContactData,
        message: 'Short',
      };

      const response = await request(app).post('/api/contact').send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    it('should sanitize email input', async () => {
      const dataWithWhitespace = {
        ...validContactData,
        email: '  john@example.com  ',
      };

      const response = await request(app).post('/api/contact').send(dataWithWhitespace);

      expect(response.status).toBe(200);
    });

    it('should accept optional recaptcha token', async () => {
      const dataWithRecaptcha = {
        ...validContactData,
        recaptchaToken: 'test-token',
      };

      const response = await request(app).post('/api/contact').send(dataWithRecaptcha);

      expect(response.status).toBe(200);
    });
  });

  describe('Rate Limiting', () => {
    it('should skip rate limiting in test environment', async () => {
      const validContactData = {
        name: 'Rate Test',
        email: 'rate@example.com',
        subject: 'Testing rate limits',
        message: 'This is testing the rate limiting functionality.',
      };

      // Make multiple requests (rate limit is bypassed in test mode)
      const requests = Array(6)
        .fill(null)
        .map(() => request(app).post('/api/contact').send(validContactData));

      const responses = await Promise.all(requests);

      // All should succeed in test environment
      const allSuccessful = responses.every((r) => r.status === 200);
      expect(allSuccessful).toBe(true);
    }, 10000); // Increase timeout for this test
  });
});
