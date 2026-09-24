const request = require('supertest');
const app = require('../src/app');
const feedbackStore = require('../src/models/feedbackStore');

describe('Student Feedback API & DevOps Integration Suite', () => {

  describe('GET /api/health', () => {
    it('should return 200 OK and health statistics', async () => {
      const res = await request(app).get('/api/health');
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual('UP');
      expect(res.body).toHaveProperty('uptime');
      expect(res.body).toHaveProperty('timestamp');
      expect(res.body.service).toEqual('EduPulse Student Feedback Portal');
    });
  });

  describe('GET /api/feedback', () => {
    it('should return all initial seed feedbacks', async () => {
      const res = await request(app).get('/api/feedback');
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.count).toBeGreaterThan(0);
    });

    it('should filter feedback by search query', async () => {
      const res = await request(app).get('/api/feedback?search=Docker');
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data[0].feedback).toContain('Docker');
    });
  });

  describe('POST /api/feedback', () => {
    it('should successfully submit valid student feedback', async () => {
      const newFeedback = {
        studentName: 'Daniel Vance',
        course: 'DevOps & Cloud Engineering',
        rating: 5,
        category: 'Course Content',
        feedback: 'CI/CD pipeline with GitHub Actions was explained flawlessly!'
      };

      const res = await request(app)
        .post('/api/feedback')
        .send(newFeedback);

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.studentName).toEqual('Daniel Vance');
      expect(res.body.data.rating).toEqual(5);
    });

    it('should reject feedback missing mandatory studentName', async () => {
      const invalidData = {
        course: 'Full Stack Web Development',
        rating: 4,
        feedback: 'Missing student name field test'
      };

      const res = await request(app)
        .post('/api/feedback')
        .send(invalidData);

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Please provide studentName');
    });

    it('should reject feedback with invalid rating out of 1-5 range', async () => {
      const invalidData = {
        studentName: 'Test Student',
        course: 'Full Stack Web Development',
        rating: 10,
        feedback: 'Rating out of range test'
      };

      const res = await request(app)
        .post('/api/feedback')
        .send(invalidData);

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Rating must be a number between 1 and 5');
    });
  });

  describe('GET /api/stats', () => {
    it('should calculate and return aggregate feedback metrics', async () => {
      const res = await request(app).get('/api/stats');
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('total');
      expect(res.body.data).toHaveProperty('avgRating');
      expect(res.body.data).toHaveProperty('courseCount');
    });
  });
});
