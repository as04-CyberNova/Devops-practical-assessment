const request = require('supertest');
const app = require('../src/app');

describe('EduPulse - Student Feedback API & DevOps Integration Suite', () => {

  // =========================================================================
  // 1. HEALTH & SYSTEM INTEGRATION TESTS
  // =========================================================================
  describe('GET /api/health', () => {
    it('TC-SYS-01: Should return 200 OK with system status, version, and uptime metadata', async () => {
      const res = await request(app).get('/api/health');
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual('UP');
      expect(res.body.service).toEqual('EduPulse Student Feedback Portal');
      expect(res.body.version).toEqual('1.0.0');
      expect(res.body).toHaveProperty('uptime');
      expect(res.body).toHaveProperty('timestamp');
    });
  });

  // =========================================================================
  // 2. VALID STUDENT FEEDBACK SUBMISSION TESTS
  // =========================================================================
  describe('POST /api/feedback - Valid Submissions', () => {
    it('TC-SUB-01: Should successfully record feedback for a valid first-time student', async () => {
      const validStudent = {
        studentName: 'Daniel Vance',
        rollNumber: '2024-CS-404',
        email: 'daniel.vance@university.edu',
        course: 'DevOps & Cloud Engineering',
        rating: 5,
        category: 'Course Content',
        feedback: 'The CI/CD pipeline and multi-stage Docker labs were explained flawlessly!'
      };

      const res = await request(app)
        .post('/api/feedback')
        .send(validStudent);

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('submitted successfully');
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.studentName).toEqual('Daniel Vance');
      expect(res.body.data.rollNumber).toEqual('2024-CS-404');
      expect(res.body.data.email).toEqual('daniel.vance@university.edu');
      expect(res.body.data.rating).toEqual(5);
    });
  });

  // =========================================================================
  // 3. DUPLICATE SUBMISSION PREVENTION TESTS (NAME / ROLL NO / EMAIL)
  // =========================================================================
  describe('POST /api/feedback - Duplicate Student Guard', () => {
    it('TC-DUP-01: Should reject duplicate feedback attempt with the SAME Name in the SAME course', async () => {
      const duplicateSubmission = {
        studentName: 'Alex Rivera', // Already exists in seed data for DevOps course
        rollNumber: '2024-CS-999',
        email: 'different.email@university.edu',
        course: 'DevOps & Cloud Engineering',
        rating: 4,
        category: 'Teaching Quality',
        feedback: 'Trying to submit a second feedback for the same course.'
      };

      const res = await request(app)
        .post('/api/feedback')
        .send(duplicateSubmission);

      expect(res.statusCode).toEqual(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Duplicate submission rejected');
    });

    it('TC-DUP-02: Should reject duplicate feedback attempt with the SAME Roll Number in the SAME course', async () => {
      const duplicateRoll = {
        studentName: 'John Doe',
        rollNumber: '2024-CS-101', // Roll number belongs to Alex Rivera in DevOps
        email: 'john.doe@university.edu',
        course: 'DevOps & Cloud Engineering',
        rating: 5,
        category: 'Assignments & Labs',
        feedback: 'Submitting feedback using another student\'s roll number.'
      };

      const res = await request(app)
        .post('/api/feedback')
        .send(duplicateRoll);

      expect(res.statusCode).toEqual(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Duplicate submission rejected');
    });

    it('TC-DUP-03: Should reject duplicate feedback attempt with the SAME Email ID in the SAME course', async () => {
      const duplicateEmail = {
        studentName: 'Jane Smith',
        rollNumber: '2024-CS-888',
        email: 'alex.rivera@university.edu', // Email belongs to Alex Rivera in DevOps
        course: 'DevOps & Cloud Engineering',
        rating: 3,
        category: 'Course Content',
        feedback: 'Attempting duplicate submission using existing registered email.'
      };

      const res = await request(app)
        .post('/api/feedback')
        .send(duplicateEmail);

      expect(res.statusCode).toEqual(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Duplicate submission rejected');
    });

    it('TC-DUP-04: Should ALLOW the same student to submit feedback for a DIFFERENT course', async () => {
      const differentCourseSubmission = {
        studentName: 'Alex Rivera', // Existing student in DevOps course
        rollNumber: '2024-CS-101',
        email: 'alex.rivera@university.edu',
        course: 'Cyber Security & Networking', // Different course!
        rating: 5,
        category: 'Infrastructure & Tools',
        feedback: 'Enrolled in Cyber Security as well. Great networking packet analysis labs!'
      };

      const res = await request(app)
        .post('/api/feedback')
        .send(differentCourseSubmission);

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.course).toEqual('Cyber Security & Networking');
    });
  });

  // =========================================================================
  // 4. INPUT VALIDATION & BOUNDARY TESTS
  // =========================================================================
  describe('POST /api/feedback - Input Validation & Boundary Checks', () => {
    it('TC-VAL-01: Should reject submission when mandatory fields (studentName, rollNumber, email, course, feedback) are missing', async () => {
      const missingFields = {
        course: 'Full Stack Web Development',
        rating: 5
      };

      const res = await request(app)
        .post('/api/feedback')
        .send(missingFields);

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('All required fields must be provided');
    });

    it('TC-VAL-02: Should reject student name shorter than 2 characters', async () => {
      const invalidName = {
        studentName: 'A',
        rollNumber: '2024-CS-500',
        email: 'a@university.edu',
        course: 'Full Stack Web Development',
        rating: 4,
        feedback: 'Valid feedback text long enough.'
      };

      const res = await request(app)
        .post('/api/feedback')
        .send(invalidName);

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Student name must be at least 2 characters long');
    });

    it('TC-VAL-03: Should reject invalid email format without @ or domain', async () => {
      const invalidEmail = {
        studentName: 'Ethan Hunt',
        rollNumber: '2024-CS-600',
        email: 'ethan.hunt-notanemail',
        course: 'Full Stack Web Development',
        rating: 4,
        feedback: 'Testing invalid email format rejection.'
      };

      const res = await request(app)
        .post('/api/feedback')
        .send(invalidEmail);

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('valid official email address');
    });

    it('TC-VAL-04: Should reject rating values outside 1-5 range (e.g. 0 or 6)', async () => {
      const invalidRatingHigh = {
        studentName: 'Olivia Wilde',
        rollNumber: '2024-CS-700',
        email: 'olivia@university.edu',
        course: 'Full Stack Web Development',
        rating: 6,
        feedback: 'Rating value is out of bounds.'
      };

      const res = await request(app)
        .post('/api/feedback')
        .send(invalidRatingHigh);

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Rating must be a number between 1 and 5');
    });

    it('TC-VAL-05: Should reject feedback comments shorter than 5 characters', async () => {
      const shortComment = {
        studentName: 'Lucas Scott',
        rollNumber: '2024-CS-701',
        email: 'lucas@university.edu',
        course: 'Full Stack Web Development',
        rating: 3,
        feedback: 'Good'
      };

      const res = await request(app)
        .post('/api/feedback')
        .send(shortComment);

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Feedback comment must be at least 5 characters long');
    });
  });

  // =========================================================================
  // 5. FEEDBACK SEARCH & FILTERING TESTS
  // =========================================================================
  describe('GET /api/feedback - Search & Filtering', () => {
    it('TC-FLT-01: Should retrieve all feedbacks with array payload structure', async () => {
      const res = await request(app).get('/api/feedback');
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.count).toBeGreaterThan(0);
    });

    it('TC-FLT-02: Should filter feedbacks by course parameter', async () => {
      const res = await request(app).get('/api/feedback?course=Full Stack Web Development');
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.every(f => f.course === 'Full Stack Web Development')).toBe(true);
    });

    it('TC-FLT-03: Should search feedback by student Roll Number or Email query keyword', async () => {
      const res = await request(app).get('/api/feedback?search=2024-SE-204');
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data[0].rollNumber).toEqual('2024-SE-204');
    });
  });

  // =========================================================================
  // 6. AGGREGATE ANALYTICS & STATS TESTS
  // =========================================================================
  describe('GET /api/stats', () => {
    it('TC-STA-01: Should calculate total feedback count, average satisfaction rating, and course breakdown', async () => {
      const res = await request(app).get('/api/stats');
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('total');
      expect(res.body.data).toHaveProperty('avgRating');
      expect(res.body.data).toHaveProperty('courseCount');
      expect(res.body.data).toHaveProperty('ratingDistribution');
    });
  });
});
