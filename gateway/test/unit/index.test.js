const request = require('supertest');

// Mock the route modules before importing the app
jest.mock('../../routes/auth', () => {
  return jest.fn(() => {
    const express = require('express');
    const router = express.Router();
    router.get('/test', (req, res) => res.json({ service: 'auth' }));
    return router;
  });
});

jest.mock('../../routes/employee', () => {
  return jest.fn(() => {
    const express = require('express');
    const router = express.Router();
    router.get('/employees/test', (req, res) => res.json({ service: 'employee' }));
    return router;
  });
});

jest.mock('../../routes/payroll', () => {
  return jest.fn(() => {
    const express = require('express');
    const router = express.Router();
    router.get('/salaries/test', (req, res) => res.json({ service: 'payroll' }));
    return router;
  });
});

// Import the app factory after mocking dependencies
const { createApp, setupErrorHandlers } = require('../../index');

describe('API Gateway Integration Tests', () => {
  let app;

  beforeEach(() => {
    // Create a fresh app for each test
    app = createApp({ withErrorHandlers: false });
  });

  test('memberikan respon untuk endpoint health check', async () => {
    const response = await request(app).get('/health');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'Gateway is running');
  });

  test('memberikan respon untuk endpoint root', async () => {
    const response = await request(app).get('/');
    
    expect(response.status).toBe(200);
    expect(response.text).toContain('API Gateway - Microservice Payroll');
  });

  test('mengarahkan permintaan auth dengan benar', async () => {
    const response = await request(app).get('/v1/auth/test');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('service', 'auth');
  });

  test('mengarahkan permintaan employee dengan benar', async () => {
    const response = await request(app).get('/v1/employees/test');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('service', 'employee');
  });

  test('mengarahkan permintaan payroll dengan benar', async () => {
    const response = await request(app).get('/v1/salaries/test');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('service', 'payroll');
  });

  test('mengembalikan 404 untuk rute yang tidak dikenal', async () => {
    const response = await request(app).get('/unknown-route');
    
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'Not Found');
  });

  // Add test to verify error handlers work when enabled
  test('mengatur error handler ketika diminta', async () => {
    // Create a new app WITH error handlers
    const appWithErrorHandlers = createApp({ withErrorHandlers: true });
    
    // Make a request to a non-existent route
    const response = await request(appWithErrorHandlers).get('/non-existent-route');
    
    // Should get a 404 with proper error format
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'Not Found');
  });

  // For these tests, add the error handlers AFTER adding custom routes
//   test('menangani error dengan benar', async () => {
//     // Add a route that throws an error
//     app.get('/error-route', () => {
//       throw new Error('Test error');
//     });
    
//     // Now add error handlers
//     setupErrorHandlers(app);
    
//     const response = await request(app).get('/error-route');
    
//     expect(response.status).toBe(500);
//     expect(response.body).toHaveProperty('error', 'Internal Server Error');
//     expect(response.body).toHaveProperty('message', 'Test error');
//   });

//   test('seharusnya bisa memparsing body JSON', async () => {
//     // Add a test route that echoes the request body
//     app.post('/echo', (req, res) => {
//       res.json(req.body);
//     });
    
//     // Now add error handlers
//     setupErrorHandlers(app);
    
//     const testData = { test: 'data', nested: { value: 123 } };
//     const response = await request(app)
//       .post('/echo')
//       .send(testData)
//       .set('Content-Type', 'application/json');
    
//     expect(response.status).toBe(200);
//     expect(response.body).toEqual(testData);
//   });

  test('menginisialisasi dengan URL service yang benar', () => {
    const authRoutes = require('../../routes/auth');
    const employeeRoutes = require('../../routes/employee');
    const payrollRoutes = require('../../routes/payroll');
    
    // Check that route modules were called with correct URLs
    expect(authRoutes).toHaveBeenCalledWith(expect.stringContaining('localhost:5001'));
    expect(employeeRoutes).toHaveBeenCalledWith(expect.stringContaining('localhost:5002'));
    expect(payrollRoutes).toHaveBeenCalledWith(expect.stringContaining('localhost:5003'));
  });

    test('menggunakan environment variable untuk URL service jika disediakan', () => {
    // Save original env vars
    const originalEnv = { ...process.env };
    
    // Mock environment variables
    process.env.AUTH_SERVICE_URL = 'http://auth-service:8001';
    process.env.EMPLOYEE_SERVICE_URL = 'http://employee-service:8002';
    process.env.PAYROLL_SERVICE_URL = 'http://payroll-service:8003';
    
    // Clear all mocks
    jest.clearAllMocks();
    
    // Create app with mocked environment
    createApp();
    
    // Get the mocked route modules
    const authRoutes = require('../../routes/auth');
    const employeeRoutes = require('../../routes/employee');
    const payrollRoutes = require('../../routes/payroll');
    
    // Check that route modules were called with correct URLs from env
    expect(authRoutes).toHaveBeenCalledWith('http://auth-service:8001');
    expect(employeeRoutes).toHaveBeenCalledWith('http://employee-service:8002');
    expect(payrollRoutes).toHaveBeenCalledWith('http://payroll-service:8003');
    
    // Restore original env vars
    process.env = originalEnv;
    });
});