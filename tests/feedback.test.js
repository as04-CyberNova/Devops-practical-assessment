const request = require('supertest');
const app = require('../src/app');

describe('Feedback API endpoints', () => {
  it('should return a healthy status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'UP');
  });

  // Tests for /api/feedback require MongoDB connection mock
});
