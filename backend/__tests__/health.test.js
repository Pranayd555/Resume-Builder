const request = require('supertest');
const mongoose = require('mongoose');

// Import app after setting up test environment
let app;
beforeAll(async () => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
  process.env.JWT_SECRET = 'test-secret';
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
  
  // Import app after environment is set
  app = require('../server');
  
  // Wait for MongoDB connection
  await new Promise(resolve => setTimeout(resolve, 1000));
});

afterAll(async () => {
  // Close MongoDB connection
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
});

describe('Health Check', () => {
  it('should return 200 for health endpoint', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'OK');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('uptime');
    expect(response.body).toHaveProperty('environment');
  });
}); 