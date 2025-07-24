const request = require('supertest');

// Import app after setting up test environment
let app;

beforeAll(async () => {
  // Import app after environment is set
  app = require('../server');
  
  // Wait for server to be ready
  await new Promise(resolve => setTimeout(resolve, 2000));
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