const request = require('supertest');
const express = require('express');
    const http = require('http');

// Mock the route modules before importing the app
jest.mock('../../../routes/auth', () => {
  return jest.fn(() => {
    const express = require('express');
    const router = express.Router();
    router.get('/test', (req, res) => res.json({ service: 'auth' }));
    return router;
  });
});

jest.mock('../../../routes/employee', () => {
  return jest.fn(() => {
    const express = require('express');
    const router = express.Router();
    router.get('/employees/test', (req, res) => res.json({ service: 'employee' }));
    return router;
  });
});

jest.mock('../../../routes/payroll', () => {
  return jest.fn(() => {
    const express = require('express');
    const router = express.Router();
    router.get('/salaries/test', (req, res) => res.json({ service: 'payroll' }));
    return router;
  });
});

// Import the app factory after mocking dependencies
const { createApp, setupErrorHandlers, startServer } = require('../../../index');

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
    // Create a new app WITH error handlers for this specific test
    const appWithErrorHandlers = createApp({ withErrorHandlers: true });
    
    const response = await request(appWithErrorHandlers).get('/unknown-route');
    
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

  test('menginisialisasi dengan URL service yang benar', () => {
    const authRoutes = require('../../../routes/auth');
    const employeeRoutes = require('../../../routes/employee');
    const payrollRoutes = require('../../../routes/payroll');
    
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
    const authRoutes = require('../../../routes/auth');
    const employeeRoutes = require('../../../routes/employee');
    const payrollRoutes = require('../../../routes/payroll');
    
    // Check that route modules were called with correct URLs from env
    expect(authRoutes).toHaveBeenCalledWith('http://auth-service:8001');
    expect(employeeRoutes).toHaveBeenCalledWith('http://employee-service:8002');
    expect(payrollRoutes).toHaveBeenCalledWith('http://payroll-service:8003');
    
    // Restore original env vars
    process.env = originalEnv;
    });

    // Uncomment and update these tests
    test('menangani error dengan benar', async () => {
    // Buat app tanpa error handler
    const testApp = express();
    testApp.use(express.json());
    
    // Tambahkan route yang melempar error
    testApp.get('/error-route', (req, res, next) => {
      const error = new Error('Test error');
      next(error); // Harus menggunakan next(error) untuk menjalankan error handler
    });
    
    // Tambahkan error handler
    setupErrorHandlers(testApp);
    
    // Test
    const response = await request(testApp).get('/error-route');
    
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Internal Server Error');
    expect(response.body).toHaveProperty('message', 'Test error');
  });
    
    test('seharusnya bisa memparsing body JSON', async () => {
    // Buat app khusus untuk test ini
    const testApp = express();
    testApp.use(express.json());
    
    // Tambahkan test route SEBELUM 404 handler
    testApp.post('/echo', (req, res) => {
      res.json(req.body);
    });
    
    // Test
    const testData = { test: 'data', nested: { value: 123 } };
    const response = await request(testApp)
      .post('/echo')
      .send(testData)
      .set('Content-Type', 'application/json');
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual(testData);
  });
  
  test('seharusnya bisa memparsing form-urlencoded', async () => {
    // Buat app khusus untuk test ini
    const testApp = express();
    testApp.use(express.urlencoded({ extended: true }));
    
    // Tambahkan test route SEBELUM 404 handler
    testApp.post('/echo-form', (req, res) => {
      res.json(req.body);
    });
    
    // Test
    const response = await request(testApp)
      .post('/echo-form')
      .send('name=test&value=123')
      .set('Content-Type', 'application/x-www-form-urlencoded');
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ name: 'test', value: '123' });
  });
    
  test('startServer harus mengembalikan instance server dan menampilkan log', () => {
    // Mock console.log
    const originalLog = console.log;
    console.log = jest.fn();
    
    // Mock http server object
    const mockServer = { on: jest.fn() };
    
    // Create a mock app with listen method
    const mockApp = {
      listen: jest.fn().mockImplementation((port, callback) => {
        callback(); // Call the callback
        return mockServer; // Return mock server
      })
    };
    
    // Call startServer from the imported module
    const server = startServer(mockApp, 4000);
    
    // Verify
    expect(server).toBe(mockServer);
    expect(console.log).toHaveBeenCalledWith('Gateway server running on port 4000');
    
    // Restore
    console.log = originalLog;
  });
    
  test('createApp dengan opsi default harus menyertakan error handlers', () => {
    // Test secara langsung implementasi createApp
    // withErrorHandlers is true by default, so setupErrorHandlers should be called
    
    // Create an app with default options (no explicit withErrorHandlers)
    const appWithDefaults = createApp();
    
    // Make a request to a non-existent route - should get 404 handler response
    return request(appWithDefaults)
      .get('/non-existent-path-for-testing')
      .then(response => {
        // If error handlers are set up, we should get the custom 404 format
        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('error', 'Not Found');
      });
  });
  
  test('404 handler harus mengembalikan respons JSON dengan format yang benar', async () => {
      // Create a new app with error handlers
      const appWith404 = createApp({ withErrorHandlers: true });
      
      // Make a request to a non-existent route
      const response = await request(appWith404).get('/non-existent-route');
      
      // Verify the response format
      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: 'Not Found',
        message: 'Route /non-existent-route not found'
      });
  });

  test('menangani error tanpa pesan dengan benar', async () => {
    // Buat app tanpa error handler
    const testApp = express();
    testApp.use(express.json());
    
    // Tambahkan route yang melempar error tanpa pesan
    testApp.get('/error-without-message', (req, res, next) => {
      const error = new Error();
      error.message = null; // Force error message to be null
      next(error);
    });
    
    // Tambahkan error handler
    setupErrorHandlers(testApp);
    
    // Test
    const response = await request(testApp).get('/error-without-message');
    
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Internal Server Error');
    expect(response.body).toHaveProperty('message', 'An unexpected error occurred');
  });
  
  test('createApp dengan withErrorHandlers=false tidak menambahkan error handlers', async () => {
    // Create app explicitly WITHOUT error handlers
    const appWithoutErrorHandlers = createApp({ withErrorHandlers: false });
    
    // Add a test route
    appWithoutErrorHandlers.get('/test-no-handlers', (req, res) => {
      res.json({ test: 'ok' });
    });
    
    // Add our own simple 404 handler for test verification
    appWithoutErrorHandlers.use((req, res) => {
      res.status(404).send('Custom 404');
    });
    
    // Test that the custom 404 handler works (confirming our error handlers weren't added)
    const response = await request(appWithoutErrorHandlers).get('/non-existent-path');
    
    expect(response.status).toBe(404);
    expect(response.text).toBe('Custom 404'); // Should be our custom handler, not the JSON format
  });
});