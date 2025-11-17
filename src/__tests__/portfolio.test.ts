import request from 'supertest';
import { app } from '../app';

describe('Portfolio Endpoints', () => {
  describe('GET /api/portfolio', () => {
    it('should return portfolio data', async () => {
      const response = await request(app).get('/api/portfolio');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('personal');
      expect(response.body.data).toHaveProperty('experience');
      expect(response.body.data).toHaveProperty('education');
      expect(response.body.data).toHaveProperty('skills');
      expect(response.body.data).toHaveProperty('projects');
      expect(response.body.data).toHaveProperty('certifications');
    });

    it('should include cache headers', async () => {
      const response = await request(app).get('/api/portfolio');

      expect(response.headers).toHaveProperty('cache-control');
      expect(response.headers['cache-control']).toContain('public');
    });
  });

  describe('GET /api/portfolio/:section', () => {
    const validSections = ['about', 'experience', 'education', 'skills', 'projects', 'certifications'];

    validSections.forEach((section) => {
      it(`should return ${section} section`, async () => {
        const response = await request(app).get(`/api/portfolio/${section}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('section', section);
        expect(response.body).toHaveProperty('data');
      });
    });

    it('should return 400 for invalid section', async () => {
      const response = await request(app).get('/api/portfolio/invalid-section');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Invalid section');
    });
  });

  describe('Portfolio Data Structure', () => {
    it('should have correct personal information structure', async () => {
      const response = await request(app).get('/api/portfolio');
      const { personal } = response.body.data;

      expect(personal).toHaveProperty('name');
      expect(personal).toHaveProperty('title');
      expect(personal).toHaveProperty('email');
      expect(personal).toHaveProperty('location');
      expect(personal).toHaveProperty('summary');
    });

    it('should have experience array with correct structure', async () => {
      const response = await request(app).get('/api/portfolio');
      const { experience } = response.body.data;

      expect(Array.isArray(experience)).toBe(true);
      expect(experience.length).toBeGreaterThan(0);
      
      const firstExp = experience[0];
      expect(firstExp).toHaveProperty('company');
      expect(firstExp).toHaveProperty('position');
      expect(firstExp).toHaveProperty('startDate');
      expect(firstExp).toHaveProperty('achievements');
      expect(Array.isArray(firstExp.achievements)).toBe(true);
    });

    it('should have skills with technical and soft categories', async () => {
      const response = await request(app).get('/api/portfolio');
      const { skills } = response.body.data;

      expect(skills).toHaveProperty('technical');
      expect(skills).toHaveProperty('soft');
      expect(Array.isArray(skills.technical)).toBe(true);
      expect(Array.isArray(skills.soft)).toBe(true);
    });
  });
});
