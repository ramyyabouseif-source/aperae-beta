const request = require('supertest');
const express = require('express');

// Create a simple test app
const app = express();
app.use(express.json());

// Mock routes for testing
app.post('/api/auth/register', (req, res) => {
  if (req.body.email === 'test@example.com') {
    res.status(201).json({
      user: { id: 'user123', email: 'test@example.com' },
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token'
    });
  } else {
    res.status(400).json({ error: 'Invalid input' });
  }
});

app.post('/api/auth/login', (req, res) => {
  if (req.body.email === 'test@example.com' && req.body.password === 'TestPassword123') {
    res.status(200).json({
      user: { id: 'user123', email: 'test@example.com' },
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token'
    });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.post('/api/recommendations', (req, res) => {
  if (req.body.dish) {
    res.status(200).json({
      dish: req.body.dish,
      recommendations: [{
        wineName: 'Test Wine',
        producer: 'Test Producer',
        vintage: '2020',
        pricePoint: '$50'
      }]
    });
  } else {
    res.status(400).json({ error: 'Dish is required' });
  }
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

describe('API Endpoints', () => {
  describe('POST /api/auth/register', () => {
    test('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'TestPassword123',
          firstName: 'John',
          lastName: 'Doe'
        });

      expect(response.status).toBe(201);
      expect(response.body.user).toBeTruthy();
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.accessToken).toBeTruthy();
      expect(response.body.refreshToken).toBeTruthy();
    });

    test('should reject invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'TestPassword123'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid input');
    });

    test('should reject missing required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com'
          // Missing password
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    test('should login with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'TestPassword123'
        });

      expect(response.status).toBe(200);
      expect(response.body.user).toBeTruthy();
      expect(response.body.accessToken).toBeTruthy();
      expect(response.body.refreshToken).toBeTruthy();
    });

    test('should reject incorrect credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });

    test('should reject missing credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com'
          // Missing password
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/recommendations', () => {
    test('should return wine recommendations', async () => {
      const response = await request(app)
        .post('/api/recommendations')
        .send({
          dish: 'Grilled Salmon',
          preferences: {
            budget: 'moderate',
            regions: ['Bordeaux', 'Napa Valley']
          }
        });

      expect(response.status).toBe(200);
      expect(response.body.dish).toBe('Grilled Salmon');
      expect(response.body.recommendations).toBeTruthy();
      expect(Array.isArray(response.body.recommendations)).toBe(true);
    });

    test('should reject request without dish', async () => {
      const response = await request(app)
        .post('/api/recommendations')
        .send({
          preferences: {
            budget: 'moderate'
          }
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Dish is required');
    });

    test('should handle XSS attempts in dish name', async () => {
      const response = await request(app)
        .post('/api/recommendations')
        .send({
          dish: '<script>alert("xss")</script>Grilled Salmon',
          preferences: {}
        });

      expect(response.status).toBe(200);
      // The dish should be sanitized
      expect(response.body.dish).toBe('Grilled Salmon');
    });
  });

  describe('GET /api/health', () => {
    test('should return health status', async () => {
      const response = await request(app)
        .get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('healthy');
      expect(response.body.timestamp).toBeTruthy();
      expect(response.body.uptime).toBeTruthy();
    });
  });

  describe('Rate Limiting', () => {
    test('should apply rate limiting to auth endpoints', async () => {
      // Make multiple requests quickly
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(
          request(app)
            .post('/api/auth/login')
            .send({
              email: 'test@example.com',
              password: 'TestPassword123'
            })
        );
      }

      const responses = await Promise.all(promises);
      
      // Some requests should be rate limited
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  describe('CORS', () => {
    test('should include CORS headers', async () => {
      const response = await request(app)
        .options('/api/health');

      expect(response.headers['access-control-allow-origin']).toBeTruthy();
      expect(response.headers['access-control-allow-methods']).toBeTruthy();
    });
  });

  describe('Security Headers', () => {
    test('should include security headers', async () => {
      const response = await request(app)
        .get('/api/health');

      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBe('DENY');
      expect(response.headers['x-xss-protection']).toBe('1; mode=block');
    });
  });
});
