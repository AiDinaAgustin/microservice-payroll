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

describe('Error Handler Branch Coverage Tests', () => {
  let originalConsoleError;
  
  beforeEach(() => {
    // Mock console.error untuk menghindari noise
    originalConsoleError = console.error;
    console.error = jest.fn();
  });
  
  afterEach(() => {
    // Restore console.error
    console.error = originalConsoleError;
  });

  test('Error handler menangani error object tanpa message dengan benar', async () => {
    // Buat app untuk testing
    const testApp = express();
    testApp.use(express.json());
    
    // Tambahkan route yang melempar error object tanpa message
    testApp.get('/error-no-message', (req, res, next) => {
      const error = { name: 'CustomError', code: 500 }; // Object tanpa message property
      next(error); // Pass object sebagai error (truthy)
    });
    
    // Setup error handlers
    setupErrorHandlers(testApp);
    
    const response = await request(testApp).get('/error-no-message');
    
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Internal Server Error');
    expect(response.body).toHaveProperty('message', 'An unexpected error occurred');
  });

  test('Error handler menangani error dengan message undefined dengan benar', async () => {
    const testApp = express();
    testApp.use(express.json());
    
    // Route yang melempar error dengan message undefined
    testApp.get('/error-undefined-message', (req, res, next) => {
      const error = new Error();
      error.message = undefined; // Explicitly set to undefined
      next(error);
    });
    
    setupErrorHandlers(testApp);
    
    const response = await request(testApp).get('/error-undefined-message');
    
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('message', 'An unexpected error occurred');
  });

  test('Error handler menangani error dengan empty string message dengan benar', async () => {
    const testApp = express();
    testApp.use(express.json());
    
    // Route yang melempar error dengan empty message
    testApp.get('/error-empty-message', (req, res, next) => {
      const error = new Error('');
      next(error);
    });
    
    setupErrorHandlers(testApp);
    
    const response = await request(testApp).get('/error-empty-message');
    
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('message', '');
  });

  test('Error handler menangani error dengan message yang ada dengan benar', async () => {
    const testApp = express();
    testApp.use(express.json());
    
    // Route yang melempar error dengan message
    testApp.get('/error-with-message', (req, res, next) => {
      const error = new Error('Custom error message');
      next(error);
    });
    
    setupErrorHandlers(testApp);
    
    const response = await request(testApp).get('/error-with-message');
    
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('message', 'Custom error message');
  });

  test('Error handler menangani error dengan message null dengan benar', async () => {
    const testApp = express();
    testApp.use(express.json());
    
    // Route yang melempar error dengan message null
    testApp.get('/error-null-message', (req, res, next) => {
      const error = new Error('test');
      error.message = null; // Explicitly set to null
      next(error);
    });
    
    setupErrorHandlers(testApp);
    
    const response = await request(testApp).get('/error-null-message');
    
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('message', 'An unexpected error occurred');
  });
});

// Tambahkan test untuk edge cases dengan direct error handler testing
describe('Direct Error Handler Testing', () => {
  test('Error handler function menangani semua branch dengan benar', () => {
    // Setup mocks
    const mockReq = {};
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const mockNext = jest.fn();
    
    // Extract error handler dari aplikasi
    const testApp = createApp();
    const errorHandler = testApp._router.stack.find(layer => 
      layer.handle.length === 4 // Error handlers have 4 parameters (err, req, res, next)
    ).handle;
    
    // Test case 1: Error falsy (ini akan test branch pertama)
    const falsyError = false;
    errorHandler(falsyError, mockReq, mockRes, mockNext);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred'
    });
    
    // Reset mocks
    mockRes.status.mockClear();
    mockRes.json.mockClear();
    
    // Test case 2: Error dengan message
    const errorWithMessage = { message: 'Test message' };
    errorHandler(errorWithMessage, mockReq, mockRes, mockNext);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Internal Server Error',
      message: 'Test message'
    });
    
    // Reset mocks
    mockRes.status.mockClear();
    mockRes.json.mockClear();
    
    // Test case 3: Error tanpa message property
    const errorWithoutMessage = { name: 'Error', code: 500 };
    errorHandler(errorWithoutMessage, mockReq, mockRes, mockNext);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred'
    });
    
    // Reset mocks
    mockRes.status.mockClear();
    mockRes.json.mockClear();
    
    // Test case 4: Error dengan empty string message
    const errorWithEmptyMessage = { message: '' };
    errorHandler(errorWithEmptyMessage, mockReq, mockRes, mockNext);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Internal Server Error',
      message: ''
    });
    
    // Reset mocks
    mockRes.status.mockClear();
    mockRes.json.mockClear();
    
    // Test case 5: Error dengan message null
    const errorWithNullMessage = { message: null };
    errorHandler(errorWithNullMessage, mockReq, mockRes, mockNext);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred'
    });

    // Reset mocks
    mockRes.status.mockClear();
    mockRes.json.mockClear();
    
    // Test case 6: Error dengan message undefined
    const errorWithUndefinedMessage = { message: undefined };
    errorHandler(errorWithUndefinedMessage, mockReq, mockRes, mockNext);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred'
    });
  });
});

// Hapus atau update test yang gagal
describe('Error Handler Edge Cases', () => {
  // Hapus test yang menggunakan next(null) dan next(false)
  // Karena Express tidak menganggap nilai falsy sebagai error
  
  test('Error handler menangani string error dengan benar', async () => {
    const testApp = express();
    testApp.use(express.json());
    
    // Route yang melempar string sebagai error
    testApp.get('/error-string', (req, res, next) => {
      next('String error message'); // String adalah truthy
    });
    
    setupErrorHandlers(testApp);
    
    const response = await request(testApp).get('/error-string');
    
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('message', 'An unexpected error occurred');
  });

  test('Error handler menangani number error dengan benar', async () => {
    const testApp = express();
    testApp.use(express.json());
    
    // Route yang melempar number sebagai error
    testApp.get('/error-number', (req, res, next) => {
      next(500); // Number adalah truthy
    });
    
    setupErrorHandlers(testApp);
    
    const response = await request(testApp).get('/error-number');
    
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('message', 'An unexpected error occurred');
  });
});

// Tambahkan setelah describe('Error Handler Edge Cases')

describe('CreateApp Options Branch Coverage Tests', () => {
  test('createApp dengan withErrorHandlers=false harus skip error handlers', async () => {
    // Mock console.log untuk capture output
    const originalConsoleLog = console.log;
    console.log = jest.fn();
    
    // Test dengan explicit false
    const appWithoutErrorHandlers = createApp({ withErrorHandlers: false });
    
    // Verifikasi bahwa log "Skipping error handlers setup" dipanggil
    expect(console.log).toHaveBeenCalledWith('Skipping error handlers setup');
    
    // Add custom 404 handler untuk test verification
    appWithoutErrorHandlers.use((req, res) => {
      res.status(404).send('No error handlers');
    });
    
    const response = await request(appWithoutErrorHandlers).get('/non-existent');
    
    expect(response.status).toBe(404);
    expect(response.text).toBe('No error handlers');
    
    // Restore console.log
    console.log = originalConsoleLog;
  });

  test('createApp dengan withErrorHandlers=true harus setup error handlers', async () => {
    const appWithErrorHandlers = createApp({ withErrorHandlers: true });
    
    const response = await request(appWithErrorHandlers).get('/non-existent');
    
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'Not Found');
  });

  test('createApp dengan withErrorHandlers=undefined harus setup error handlers (default)', async () => {
    const appWithUndefined = createApp({ withErrorHandlers: undefined });
    
    const response = await request(appWithUndefined).get('/non-existent');
    
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'Not Found');
  });

  test('createApp dengan withErrorHandlers=null harus setup error handlers (default)', async () => {
    const appWithNull = createApp({ withErrorHandlers: null });
    
    const response = await request(appWithNull).get('/non-existent');
    
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'Not Found');
  });

  test('createApp dengan withErrorHandlers=0 harus setup error handlers (falsy tapi bukan false)', async () => {
    const appWithZero = createApp({ withErrorHandlers: 0 });
    
    const response = await request(appWithZero).get('/non-existent');
    
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'Not Found');
  });

  test('createApp dengan withErrorHandlers="" harus setup error handlers (falsy tapi bukan false)', async () => {
    const appWithEmptyString = createApp({ withErrorHandlers: '' });
    
    const response = await request(appWithEmptyString).get('/non-existent');
    
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'Not Found');
  });

  test('createApp dengan options kosong harus setup error handlers', async () => {
    const appWithEmpty = createApp({});
    
    const response = await request(appWithEmpty).get('/non-existent');
    
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'Not Found');
  });

  test('createApp tanpa parameter harus setup error handlers', async () => {
    const appDefault = createApp();
    
    const response = await request(appDefault).get('/non-existent');
    
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'Not Found');
  });
});

describe('Error Handler Message Branch Coverage', () => {
  let originalConsoleError;
  
  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });
  
  afterEach(() => {
    console.error = originalConsoleError;
  });

  test('Error handler menangani error dengan message boolean false', async () => {
    const testApp = express();
    testApp.use(express.json());
    
    testApp.get('/error-boolean-false', (req, res, next) => {
      const error = { message: false }; // Boolean false
      next(error);
    });
    
    setupErrorHandlers(testApp);
    
    const response = await request(testApp).get('/error-boolean-false');
    
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('message', 'An unexpected error occurred');
  });

  test('Error handler menangani error dengan message number 0', async () => {
    const testApp = express();
    testApp.use(express.json());
    
    testApp.get('/error-number-zero', (req, res, next) => {
      const error = { message: 0 }; // Number 0 (falsy)
      next(error);
    });
    
    setupErrorHandlers(testApp);
    
    const response = await request(testApp).get('/error-number-zero');
    
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('message', 'An unexpected error occurred');
  });

  test('Error handler menangani error dengan message string "0"', async () => {
    const testApp = express();
    testApp.use(express.json());
    
    testApp.get('/error-string-zero', (req, res, next) => {
      const error = { message: '0' }; // String "0" (truthy)
      next(error);
    });
    
    setupErrorHandlers(testApp);
    
    const response = await request(testApp).get('/error-string-zero');
    
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('message', '0');
  });

  test('Error handler menangani error dengan message string "false"', async () => {
    const testApp = express();
    testApp.use(express.json());
    
    testApp.get('/error-string-false', (req, res, next) => {
      const error = { message: 'false' }; // String "false" (truthy)
      next(error);
    });
    
    setupErrorHandlers(testApp);
    
    const response = await request(testApp).get('/error-string-false');
    
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('message', 'false');
  });

  test('Error handler menangani error dengan message whitespace string', async () => {
    const testApp = express();
    testApp.use(express.json());
    
    testApp.get('/error-whitespace', (req, res, next) => {
      const error = { message: '   ' }; // Whitespace string (truthy)
      next(error);
    });
    
    setupErrorHandlers(testApp);
    
    const response = await request(testApp).get('/error-whitespace');
    
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('message', '   ');
  });
});

describe('Specific Branch Coverage for Lines 189-190', () => {
  test('Error handler dengan kondisi err.message === "" (empty string)', async () => {
    const testApp = express();
    testApp.use(express.json());
    
    // Test spesifik untuk branch err.message === ''
    testApp.get('/test-empty-string-branch', (req, res, next) => {
      const error = new Error();
      error.message = ''; // Explicitly empty string
      next(error);
    });
    
    setupErrorHandlers(testApp);
    
    const response = await request(testApp).get('/test-empty-string-branch');
    
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('message', ''); // Should return empty string
  });

  test('Direct test untuk semua branch di error handler', () => {
    // Setup mocks
    const mockReq = {};
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const mockNext = jest.fn();
    
    // Mock console.error
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    // Create app dan extract error handler
    const testApp = createApp();
    const errorHandler = testApp._router.stack.find(layer => 
      layer.handle && layer.handle.length === 4
    ).handle;
    
    // Test case 1: err falsy (undefined)
    errorHandler(undefined, mockReq, mockRes, mockNext);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred'
    });
    
    // Reset mocks
    mockRes.status.mockClear();
    mockRes.json.mockClear();
    
    // Test case 2: err truthy tapi message falsy (undefined)
    const errorNoMessage = { name: 'TestError' };
    errorHandler(errorNoMessage, mockReq, mockRes, mockNext);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred'
    });
    
    // Reset mocks
    mockRes.status.mockClear();
    mockRes.json.mockClear();
    
    // Test case 3: err truthy dengan message truthy
    const errorWithMessage = { message: 'Test message' };
    errorHandler(errorWithMessage, mockReq, mockRes, mockNext);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Internal Server Error',
      message: 'Test message'
    });
    
    // Reset mocks
    mockRes.status.mockClear();
    mockRes.json.mockClear();
    
    // Test case 4: err truthy dengan message === '' (empty string)
    const errorWithEmptyMessage = { message: '' };
    errorHandler(errorWithEmptyMessage, mockReq, mockRes, mockNext);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Internal Server Error',
      message: ''
    });
    
    // Reset mocks
    mockRes.status.mockClear();
    mockRes.json.mockClear();
    
    // Test case 5: err truthy dengan message null
    const errorWithNullMessage = { message: null };
    errorHandler(errorWithNullMessage, mockReq, mockRes, mockNext);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred'
    });
    
    // Reset mocks
    mockRes.status.mockClear();
    mockRes.json.mockClear();
    
    // Test case 6: err truthy dengan message false
    const errorWithFalseMessage = { message: false };
    errorHandler(errorWithFalseMessage, mockReq, mockRes, mockNext);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred'
    });
    
    // Restore console.error
    console.error = originalConsoleError;
  });
});

describe('StartServer Function Branch Coverage', () => {
  test('startServer dengan port default', () => {
    // Mock console.log
    const originalLog = console.log;
    console.log = jest.fn();
    
    // Create a mock app
    const mockApp = {
      listen: jest.fn().mockImplementation((port, callback) => {
        callback();
        return { on: jest.fn() };
      })
    };
    
    // Test dengan port default (tidak memberikan port parameter)
    const server = startServer(mockApp);
    
    // Perbaikan: Port default adalah string "5000" dari process.env.PORT || 5000
    expect(mockApp.listen).toHaveBeenCalledWith("5000", expect.any(Function));
    expect(console.log).toHaveBeenCalledWith('Gateway server running on port 5000');
    
    // Restore console.log
    console.log = originalLog;
  });

  test('startServer dengan port custom', () => {
    // Mock console.log
    const originalLog = console.log;
    console.log = jest.fn();
    
    // Create a mock app
    const mockApp = {
      listen: jest.fn().mockImplementation((port, callback) => {
        callback();
        return { on: jest.fn() };
      })
    };
    
    // Test dengan port custom
    const customPort = 8080;
    const server = startServer(mockApp, customPort);
    
    // Verify custom port digunakan
    expect(mockApp.listen).toHaveBeenCalledWith(customPort, expect.any(Function));
    expect(console.log).toHaveBeenCalledWith('Gateway server running on port 8080');
    
    // Restore console.log
    console.log = originalLog;
  });

  test('startServer dengan environment PORT variable', () => {
    // Save original env
    const originalEnv = process.env.PORT;
    
    // Mock environment variable
    process.env.PORT = '3000';
    
    // Mock console.log
    const originalLog = console.log;
    console.log = jest.fn();
    
    // Create a mock app
    const mockApp = {
      listen: jest.fn().mockImplementation((port, callback) => {
        callback();
        return { on: jest.fn() };
      })
    };
    
    // Test dengan environment port (tidak memberikan port parameter)
    const server = startServer(mockApp);
    
    // Verify environment port digunakan
    expect(mockApp.listen).toHaveBeenCalledWith('3000', expect.any(Function));
    expect(console.log).toHaveBeenCalledWith('Gateway server running on port 3000');
    
    // Restore
    console.log = originalLog;
    process.env.PORT = originalEnv;
  });
});

describe('Comprehensive Error Handler Branch Testing', () => {
  let originalConsoleError;
  
  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });
  
  afterEach(() => {
    console.error = originalConsoleError;
  });

  test('Error handler dengan kondisi err.message === 0 (number falsy)', async () => {
    const testApp = express();
    testApp.use(express.json());
    
    testApp.get('/error-number-zero-message', (req, res, next) => {
      const error = { message: 0 }; // Number 0 (falsy)
      next(error);
    });
    
    setupErrorHandlers(testApp);
    
    const response = await request(testApp).get('/error-number-zero-message');
    
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('message', 'An unexpected error occurred');
  });

  test('Error handler dengan kondisi err.message === false (boolean falsy)', async () => {
    const testApp = express();
    testApp.use(express.json());
    
    testApp.get('/error-false-message', (req, res, next) => {
      const error = { message: false }; // Boolean false (falsy)
      next(error);
    });
    
    setupErrorHandlers(testApp);
    
    const response = await request(testApp).get('/error-false-message');
    
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('message', 'An unexpected error occurred');
  });

  test('Error handler dengan kondisi err.message === NaN (number falsy)', async () => {
    const testApp = express();
    testApp.use(express.json());
    
    testApp.get('/error-nan-message', (req, res, next) => {
      const error = { message: NaN }; // NaN (falsy)
      next(error);
    });
    
    setupErrorHandlers(testApp);
    
    const response = await request(testApp).get('/error-nan-message');
    
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('message', 'An unexpected error occurred');
  });

  test('Error handler dengan err sebagai array kosong', async () => {
    const testApp = express();
    testApp.use(express.json());
    
    testApp.get('/error-empty-array', (req, res, next) => {
      const error = []; // Array kosong (truthy tapi tidak ada message)
      next(error);
    });
    
    setupErrorHandlers(testApp);
    
    const response = await request(testApp).get('/error-empty-array');
    
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('message', 'An unexpected error occurred');
  });

  test('Error handler dengan err sebagai function', async () => {
    const testApp = express();
    testApp.use(express.json());
    
    testApp.get('/error-function', (req, res, next) => {
      const error = function() { return 'error'; }; // Function (truthy tapi tidak ada message)
      next(error);
    });
    
    setupErrorHandlers(testApp);
    
    const response = await request(testApp).get('/error-function');
    
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('message', 'An unexpected error occurred');
  });
});

describe('Direct Error Handler Complete Branch Testing', () => {
  test('Test semua kombinasi err dan err.message untuk 100% branch coverage', () => {
    // Setup mocks
    const mockReq = {};
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const mockNext = jest.fn();
    
    // Mock console.error
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    // Create app dan extract error handler
    const testApp = createApp();
    const errorHandler = testApp._router.stack.find(layer => 
      layer.handle && layer.handle.length === 4
    ).handle;

    // Test scenarios untuk mencapai 100% branch coverage
    const testScenarios = [
      // Branch 1: err falsy
      { err: undefined, expectedMessage: 'An unexpected error occurred', description: 'err undefined' },
      { err: null, expectedMessage: 'An unexpected error occurred', description: 'err null' },
      { err: false, expectedMessage: 'An unexpected error occurred', description: 'err false' },
      { err: 0, expectedMessage: 'An unexpected error occurred', description: 'err 0' },
      { err: '', expectedMessage: 'An unexpected error occurred', description: 'err empty string' },
      
      // Branch 2: err truthy, message falsy (not empty string)
      { err: { name: 'Error' }, expectedMessage: 'An unexpected error occurred', description: 'err truthy, no message property' },
      { err: { message: undefined }, expectedMessage: 'An unexpected error occurred', description: 'err truthy, message undefined' },
      { err: { message: null }, expectedMessage: 'An unexpected error occurred', description: 'err truthy, message null' },
      { err: { message: false }, expectedMessage: 'An unexpected error occurred', description: 'err truthy, message false' },
      { err: { message: 0 }, expectedMessage: 'An unexpected error occurred', description: 'err truthy, message 0' },
      { err: { message: NaN }, expectedMessage: 'An unexpected error occurred', description: 'err truthy, message NaN' },
      
      // Branch 3: err truthy, message empty string (special case)
      { err: { message: '' }, expectedMessage: '', description: 'err truthy, message empty string' },
      
      // Branch 4: err truthy, message truthy
      { err: { message: 'Test message' }, expectedMessage: 'Test message', description: 'err truthy, message truthy' },
      { err: { message: 'false' }, expectedMessage: 'false', description: 'err truthy, message string "false"' },
      { err: { message: '0' }, expectedMessage: '0', description: 'err truthy, message string "0"' },
      { err: { message: '   ' }, expectedMessage: '   ', description: 'err truthy, message whitespace' },
      { err: { message: 1 }, expectedMessage: 1, description: 'err truthy, message number 1' },
      { err: { message: true }, expectedMessage: true, description: 'err truthy, message true' },
      { err: { message: [] }, expectedMessage: [], description: 'err truthy, message empty array' },
      { err: { message: {} }, expectedMessage: {}, description: 'err truthy, message empty object' }
    ];

    testScenarios.forEach((scenario, index) => {
      // Reset mocks
      mockRes.status.mockClear();
      mockRes.json.mockClear();
      
      // Test scenario
      errorHandler(scenario.err, mockReq, mockRes, mockNext);
      
      // Verify result
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Internal Server Error',
        message: scenario.expectedMessage
      });
    });
    
    // Restore console.error
    console.error = originalConsoleError;
  });
});

describe('Additional CreateApp Branch Coverage', () => {
  test('createApp dengan withErrorHandlers sebagai string kosong (falsy)', async () => {
    const appWithEmptyString = createApp({ withErrorHandlers: '' });
    
    const response = await request(appWithEmptyString).get('/non-existent');
    
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'Not Found');
  });

  test('createApp dengan withErrorHandlers sebagai NaN (falsy)', async () => {
    const appWithNaN = createApp({ withErrorHandlers: NaN });
    
    const response = await request(appWithNaN).get('/non-existent');
    
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'Not Found');
  });

  test('createApp dengan withErrorHandlers sebagai array kosong (truthy)', async () => {
    const appWithEmptyArray = createApp({ withErrorHandlers: [] });
    
    const response = await request(appWithEmptyArray).get('/non-existent');
    
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'Not Found');
  });

  test('createApp dengan withErrorHandlers sebagai object kosong (truthy)', async () => {
    const appWithEmptyObject = createApp({ withErrorHandlers: {} });
    
    const response = await request(appWithEmptyObject).get('/non-existent');
    
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'Not Found');
  });

  test('createApp dengan withErrorHandlers sebagai string "false" (truthy)', async () => {
    const appWithStringFalse = createApp({ withErrorHandlers: 'false' });
    
    const response = await request(appWithStringFalse).get('/non-existent');
    
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'Not Found');
  });
});