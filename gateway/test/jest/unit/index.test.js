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

// Mock healthChecker
jest.mock('../../../services/healthChecker', () => ({
  startMonitoring: jest.fn(),
  stopMonitoring: jest.fn(),
  getServiceStatus: jest.fn(() => ({
    employees_primary: { healthy: true, url: 'http://localhost:5002', lastCheck: new Date() },
    employees_fallback: { healthy: false, url: 'http://localhost:5003', lastCheck: new Date() }
  }))
}));

// Import the app factory after mocking dependencies
const { createApp, setupErrorHandlers, startServer } = require('../../../index');
const healthChecker = require('../../../services/healthChecker');

describe('API Gateway Integration Tests', () => {
  let app;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    // Create a fresh app for each test
    app = createApp({ withErrorHandlers: false });
  });

  test('memberikan respon untuk endpoint health check', async () => {
    const response = await request(app).get('/health');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'Gateway is running');
  });

  // ➕ Test untuk /health/services endpoint (lines 111-112)
  test('memberikan respon untuk endpoint health services', async () => {
    const response = await request(app).get('/health/services');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('gateway', 'healthy');
    expect(response.body).toHaveProperty('services');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body.services).toHaveProperty('employees_primary');
    expect(healthChecker.getServiceStatus).toHaveBeenCalled();
  });

  test('memberikan respon untuk endpoint root', async () => {
    const response = await request(app).get('/');
    
    expect(response.status).toBe(200);
    expect(response.text).toContain('API Gateway - Microservice Payroll with Failover Support');
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

  test('mengatur error handler ketika diminta', async () => {
    const appWithErrorHandlers = createApp({ withErrorHandlers: true });
    
    const response = await request(appWithErrorHandlers).get('/non-existent-route');
    
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'Not Found');
  });

  test('menginisialisasi dengan URL service yang benar', () => {
    const authRoutes = require('../../../routes/auth');
    const employeeRoutes = require('../../../routes/employee');
    const payrollRoutes = require('../../../routes/payroll');
    
    expect(authRoutes).toHaveBeenCalledWith(expect.stringContaining('localhost:5001'));
    expect(employeeRoutes).toHaveBeenCalledWith(expect.stringContaining('localhost:5002'));
    expect(payrollRoutes).toHaveBeenCalledWith(expect.stringContaining('localhost:5003'));
  });

  test('menggunakan environment variable untuk URL service jika disediakan', () => {
    const originalEnv = { ...process.env };
    
    process.env.AUTH_SERVICE_URL = 'http://auth-service:8001';
    process.env.EMPLOYEE_SERVICE_URL = 'http://employee-service:8002';
    process.env.PAYROLL_SERVICE_URL = 'http://payroll-service:8003';
    
    jest.clearAllMocks();
    
    createApp();
    
    const authRoutes = require('../../../routes/auth');
    const employeeRoutes = require('../../../routes/employee');
    const payrollRoutes = require('../../../routes/payroll');
    
    expect(authRoutes).toHaveBeenCalledWith('http://auth-service:8001');
    expect(employeeRoutes).toHaveBeenCalledWith('http://employee-service:8002');
    expect(payrollRoutes).toHaveBeenCalledWith('http://payroll-service:8003');
    
    process.env = originalEnv;
  });

  // ➕ Test untuk ENABLE_SERVICE_FAILOVER environment variable (lines 204-206)
  test('harus memulai health monitoring ketika ENABLE_SERVICE_FAILOVER=true', () => {
    const originalEnv = process.env.ENABLE_SERVICE_FAILOVER;
    process.env.ENABLE_SERVICE_FAILOVER = 'true';
    
    jest.clearAllMocks();
    
    createApp();
    
    expect(healthChecker.startMonitoring).toHaveBeenCalled();
    
    process.env.ENABLE_SERVICE_FAILOVER = originalEnv;
  });

  // ➕ Test untuk ketika ENABLE_SERVICE_FAILOVER tidak diset
  test('tidak harus memulai health monitoring ketika ENABLE_SERVICE_FAILOVER tidak diset', () => {
    const originalEnv = process.env.ENABLE_SERVICE_FAILOVER;
    delete process.env.ENABLE_SERVICE_FAILOVER;
    
    jest.clearAllMocks();
    
    createApp();
    
    expect(healthChecker.startMonitoring).not.toHaveBeenCalled();
    
    process.env.ENABLE_SERVICE_FAILOVER = originalEnv;
  });

  test('menangani error dengan benar', async () => {
    const testApp = express();
    testApp.use(express.json());
    
    testApp.get('/error-route', (req, res, next) => {
      const error = new Error('Test error');
      next(error);
    });
    
    setupErrorHandlers(testApp);
    
    const response = await request(testApp).get('/error-route');
    
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Internal Server Error');
    expect(response.body).toHaveProperty('message', 'Test error');
  });
    
  test('seharusnya bisa memparsing body JSON', async () => {
    const testApp = express();
    testApp.use(express.json());
    
    testApp.post('/echo', (req, res) => {
      res.json(req.body);
    });
    
    const testData = { test: 'data', nested: { value: 123 } };
    const response = await request(testApp)
      .post('/echo')
      .send(testData)
      .set('Content-Type', 'application/json');
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual(testData);
  });
  
  test('seharusnya bisa memparsing form-urlencoded', async () => {
    const testApp = express();
    testApp.use(express.urlencoded({ extended: true }));
    
    testApp.post('/echo-form', (req, res) => {
      res.json(req.body);
    });
    
    const response = await request(testApp)
      .post('/echo-form')
      .send('name=test&value=123')
      .set('Content-Type', 'application/x-www-form-urlencoded');
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ name: 'test', value: '123' });
  });
    
  test('startServer harus mengembalikan instance server dan menampilkan log', () => {
    const originalLog = console.log;
    console.log = jest.fn();
    
    const mockServer = { on: jest.fn() };
    
    const mockApp = {
      listen: jest.fn().mockImplementation((port, callback) => {
        callback();
        return mockServer;
      })
    };
    
    const server = startServer(mockApp, 4000);
    
    expect(server).toBe(mockServer);
    expect(console.log).toHaveBeenCalledWith('Gateway server running on port 4000');
    
    console.log = originalLog;
  });
    
  test('createApp dengan opsi default harus menyertakan error handlers', () => {
    const appWithDefaults = createApp();
    
    return request(appWithDefaults)
      .get('/non-existent-path-for-testing')
      .then(response => {
        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('error', 'Not Found');
      });
  });
  
  test('404 handler harus mengembalikan respons JSON dengan format yang benar', async () => {
    const appWith404 = createApp({ withErrorHandlers: true });
    
    const response = await request(appWith404).get('/non-existent-route');
    
    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: 'Not Found',
      message: 'Route /non-existent-route not found'
    });
  });

  test('createApp dengan withErrorHandlers=false tidak menambahkan error handlers', async () => {
    const appWithoutErrorHandlers = createApp({ withErrorHandlers: false });
    
    appWithoutErrorHandlers.get('/test-no-handlers', (req, res) => {
      res.json({ test: 'ok' });
    });
    
    appWithoutErrorHandlers.use((req, res) => {
      res.status(404).send('Custom 404');
    });
    
    const response = await request(appWithoutErrorHandlers).get('/non-existent-path');
    
    expect(response.status).toBe(404);
    expect(response.text).toBe('Custom 404');
  });
});

// ➕ Test untuk Error Handler branch coverage yang lebih lengkap
describe('Error Handler Branch Coverage Tests', () => {
  let originalConsoleError;
  
  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });
  
  afterEach(() => {
    console.error = originalConsoleError;
  });

  // ➕ Test untuk semua branch di error handler (lines 210-212, 226-227)
  test('Error handler menangani error dengan hasOwnProperty message = true dan message truthy', async () => {
    const testApp = express();
    testApp.use(express.json());
    
    testApp.get('/error-has-message-truthy', (req, res, next) => {
      const error = { message: 'Custom error message' };
      next(error);
    });
    
    setupErrorHandlers(testApp);
    
    const response = await request(testApp).get('/error-has-message-truthy');
    
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('message', 'Custom error message');
  });

  test('Error handler menangani error dengan hasOwnProperty message = true dan message empty string', async () => {
    const testApp = express();
    testApp.use(express.json());
    
    testApp.get('/error-has-message-empty', (req, res, next) => {
      const error = { message: '' };
      next(error);
    });
    
    setupErrorHandlers(testApp);
    
    const response = await request(testApp).get('/error-has-message-empty');
    
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('message', '');
  });

  test('Error handler menangani error dengan hasOwnProperty message = true dan message falsy (not empty string)', async () => {
    const testApp = express();
    testApp.use(express.json());
    
    testApp.get('/error-has-message-falsy', (req, res, next) => {
      const error = { message: null };
      next(error);
    });
    
    setupErrorHandlers(testApp);
    
    const response = await request(testApp).get('/error-has-message-falsy');
    
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('message', 'An unexpected error occurred');
  });

  test('Error handler menangani error dengan hasOwnProperty message = false', async () => {
    const testApp = express();
    testApp.use(express.json());
    
    testApp.get('/error-no-message-property', (req, res, next) => {
      const error = { name: 'TestError', code: 500 }; // No message property
      next(error);
    });
    
    setupErrorHandlers(testApp);
    
    const response = await request(testApp).get('/error-no-message-property');
    
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('message', 'An unexpected error occurred');
  });

// ➕ Fix: Error handler untuk error falsy
test('Error handler menangani error falsy', () => {
  const testApp = express();
  setupErrorHandlers(testApp);
  
  // ➕ Test error handler middleware secara langsung
  const mockReq = { url: '/error-falsy' };
  const mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  };
  const mockNext = jest.fn();
  
  // Find error handler middleware (has 4 parameters)
  const errorHandler = testApp._router.stack.find(layer => 
    layer.handle && layer.handle.length === 4
  ).handle;
  
  // Test dengan null error (falsy)
  errorHandler(null, mockReq, mockRes, mockNext);
  
  expect(mockRes.status).toHaveBeenCalledWith(500);
  expect(mockRes.json).toHaveBeenCalledWith({
    error: 'Internal Server Error',
    message: 'An unexpected error occurred'
  });
});

  // ➕ Test untuk mencakup semua kemungkinan branch
  test('Error handler dengan berbagai kondisi message', async () => {
    const testCases = [
      { message: undefined, expected: 'An unexpected error occurred', name: 'undefined' },
      { message: null, expected: 'An unexpected error occurred', name: 'null' },
      { message: false, expected: 'An unexpected error occurred', name: 'false' },
      { message: 0, expected: 'An unexpected error occurred', name: '0' },
      { message: NaN, expected: 'An unexpected error occurred', name: 'NaN' },
      { message: '', expected: '', name: 'empty-string' },
      { message: 'Valid message', expected: 'Valid message', name: 'valid-message' },
      { message: ' ', expected: ' ', name: 'space' },
      { message: '0', expected: '0', name: 'string-zero' }
    ];

    for (const testCase of testCases) {
      const testApp = express();
      testApp.use(express.json());
      
      // ➕ Create unique route for each test case
      testApp.get(`/error-test-${testCase.name}`, (req, res, next) => {
        const error = { message: testCase.message };
        next(error);
      });
      
      setupErrorHandlers(testApp);
      
      const response = await request(testApp).get(`/error-test-${testCase.name}`);
      
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('message', testCase.expected);
    }
  });
});

// ➕ Test untuk startServer default port
describe('StartServer Function Tests', () => {
  test('startServer dengan port default dari environment', () => {
    const originalEnv = process.env.PORT;
    const originalLog = console.log;
    
    process.env.PORT = '3000';
    console.log = jest.fn();
    
    const mockServer = { on: jest.fn() };
    const mockApp = {
      listen: jest.fn().mockImplementation((port, callback) => {
        callback();
        return mockServer;
      })
    };
    
    const server = startServer(mockApp);
    
    expect(mockApp.listen).toHaveBeenCalledWith('3000', expect.any(Function));
    expect(console.log).toHaveBeenCalledWith('Gateway server running on port 3000');
    
    process.env.PORT = originalEnv;
    console.log = originalLog;
  });

  test('startServer dengan port default 5000 ketika tidak ada environment variable', () => {
    const originalEnv = process.env.PORT;
    const originalLog = console.log;
    
    delete process.env.PORT;
    console.log = jest.fn();
    
    const mockServer = { on: jest.fn() };
    const mockApp = {
      listen: jest.fn().mockImplementation((port, callback) => {
        callback();
        return mockServer;
      })
    };
    
    const server = startServer(mockApp);
    
    expect(mockApp.listen).toHaveBeenCalledWith(5000, expect.any(Function));
    expect(console.log).toHaveBeenCalledWith('Gateway server running on port 5000');
    
    process.env.PORT = originalEnv;
    console.log = originalLog;
  });
});

// ➕ Test untuk require.main === module condition (though this won't be hit in tests)
describe('Module Execution Tests', () => {
  test('tidak harus menjalankan server ketika diimport sebagai module', () => {
    // Saat di-import untuk testing, require.main !== module
    // Sehingga server tidak akan dijalankan
    // Test ini hanya untuk dokumentasi behavior
    expect(require.main).not.toBe(module);
  });
});

// ➕ Test createApp options variations
describe('CreateApp Options Tests', () => {
  test('createApp dengan withErrorHandlers = false harus log skip message', () => {
    const originalLog = console.log;
    console.log = jest.fn();
    
    createApp({ withErrorHandlers: false });
    
    expect(console.log).toHaveBeenCalledWith('Skipping error handlers setup');
    
    console.log = originalLog;
  });

  test('createApp dengan withErrorHandlers = true tidak harus log skip message', () => {
    const originalLog = console.log;
    console.log = jest.fn();
    
    createApp({ withErrorHandlers: true });
    
    expect(console.log).not.toHaveBeenCalledWith('Skipping error handlers setup');
    
    console.log = originalLog;
  });

  test('createApp dengan withErrorHandlers = undefined tidak harus log skip message', () => {
    const originalLog = console.log;
    console.log = jest.fn();
    
    createApp({ withErrorHandlers: undefined });
    
    expect(console.log).not.toHaveBeenCalledWith('Skipping error handlers setup');
    
    console.log = originalLog;
  });
});