import request from 'supertest';
import app from '../src/app';

describe('Express App Configuration', () => {
  it('should have JSON middleware', async () => {
    const response = await request(app)
      .post('/test-endpoint')
      .send({ test: 'data' });
    
    expect(response.status).toBe(404); // Should reach not found handler
    expect(response.type).toBe('application/json');
  });

  it('should have CORS enabled', async () => {
    const response = await request(app).get('/');
    expect(response.headers['access-control-allow-origin']).toBe('*');
  });

  it('should handle 404 errors', async () => {
    const response = await request(app).get('/non-existent-route');
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message', 'Route not found');
  });

  describe('Express App Security', () => {
  it('should have security headers (helmet)', async () => {
    const response = await request(app).get('/');
    expect(response.headers).toHaveProperty('x-frame-options');
    expect(response.headers).toHaveProperty('x-xss-protection');
  });
});

describe('Express App API Documentation', () => {
   it('should serve swagger documentation', async () => {
     const response = await request(app).get('/api-docs/');
     expect(response.status).toBe(200);
   });
 });
});