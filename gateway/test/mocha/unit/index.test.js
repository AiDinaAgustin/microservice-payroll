const request = require('supertest');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const proxyquire = require('proxyquire');
const express = require('express');

// Use sinon-chai for spy assertions
chai.use(sinonChai);
const expect = chai.expect;

// Create route stubs
const authRoutesStub = sinon.stub().callsFake(() => {
  const router = express.Router();
  router.get('/test', (req, res) => res.json({ service: 'auth' }));
  return router;
});

const employeeRoutesStub = sinon.stub().callsFake(() => {
  const router = express.Router();
  router.get('/employees/test', (req, res) => res.json({ service: 'employee' }));
  return router;
});

const payrollRoutesStub = sinon.stub().callsFake(() => {
  const router = express.Router();
  router.get('/salaries/test', (req, res) => res.json({ service: 'payroll' }));
  return router;
});

// Import the app with mocked routes
const { createApp, setupErrorHandlers } = proxyquire('../../../index', {
  './routes/auth': authRoutesStub,
  './routes/employee': employeeRoutesStub,
  './routes/payroll': payrollRoutesStub
});

describe('API Gateway Integration Tests', () => {
  let app;
  let originalEnv;

  beforeEach(() => {
    // Save original env vars
    originalEnv = { ...process.env };
    
    // Create a fresh app for each test
    app = createApp();
  });

  afterEach(() => {
    // Restore original env vars
    process.env = originalEnv;
    sinon.restore();
  });

  it('memberikan respon untuk endpoint health check', async () => {
    const response = await request(app).get('/health');
    
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('status', 'Gateway is running');
  });

  it('memberikan respon untuk endpoint root', async () => {
    const response = await request(app).get('/');
    
    expect(response.status).to.equal(200);
    expect(response.text).to.include('API Gateway - Microservice Payroll');
  });

  it('mengarahkan permintaan auth dengan benar', async () => {
    const response = await request(app).get('/v1/auth/test');
    
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('service', 'auth');
  });

  it('mengarahkan permintaan employee dengan benar', async () => {
    const response = await request(app).get('/v1/employees/test');
    
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('service', 'employee');
  });

  it('mengarahkan permintaan payroll dengan benar', async () => {
    const response = await request(app).get('/v1/salaries/test');
    
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('service', 'payroll');
  });

  it('mengembalikan 404 untuk rute yang tidak dikenal', async () => {
    const response = await request(app).get('/unknown-route');
    
    expect(response.status).to.equal(404);
    expect(response.body).to.have.property('error', 'Not Found');
  });

  it('menginisialisasi dengan URL service yang benar', () => {
    // Check that route modules were called with correct URLs
    expect(authRoutesStub).to.have.been.calledWith(sinon.match.string.and(sinon.match(/localhost:5001/)));
    expect(employeeRoutesStub).to.have.been.calledWith(sinon.match.string.and(sinon.match(/localhost:5002/)));
    expect(payrollRoutesStub).to.have.been.calledWith(sinon.match.string.and(sinon.match(/localhost:5003/)));
  });

  it('menggunakan environment variable untuk URL service jika disediakan', () => {
    // Reset stubs call history
    authRoutesStub.resetHistory();
    employeeRoutesStub.resetHistory();
    payrollRoutesStub.resetHistory();
    
    // Mock environment variables
    process.env.AUTH_SERVICE_URL = 'http://auth-service:8001';
    process.env.EMPLOYEE_SERVICE_URL = 'http://employee-service:8002';
    process.env.PAYROLL_SERVICE_URL = 'http://payroll-service:8003';
    
    // Create app with mocked environment
    createApp();
    
    // Check that route modules were called with correct URLs from env
    expect(authRoutesStub).to.have.been.calledWith('http://auth-service:8001');
    expect(employeeRoutesStub).to.have.been.calledWith('http://employee-service:8002');
    expect(payrollRoutesStub).to.have.been.calledWith('http://payroll-service:8003');
  });

  it('mengatur error handler ketika diminta', async () => {
    // Create a new app
    const testApp = express();
    
    // Add a test route
    testApp.get('/test-route', (req, res) => {
      res.status(200).json({ success: true });
    });
    
    // Add error handlers
    setupErrorHandlers(testApp);
    
    // Make a request to a non-existent route
    const response = await request(testApp).get('/non-existent-route');
    
    // Should get a 404 with proper error format
    expect(response.status).to.equal(404);
    expect(response.body).to.have.property('error', 'Not Found');
  });

  // Additional tests that were commented out in the Jest version:

  it('menangani error dengan benar', async () => {
  // Stub console.error untuk test ini
  const originalConsoleError = console.error;
  console.error = sinon.stub();
  
  // Create a new app
  const testApp = express();
  
  // Add a route that throws an error
  testApp.get('/error-route', () => {
    throw new Error('Test error');
  });
  
  // Now add error handlers
  setupErrorHandlers(testApp);
  
  const response = await request(testApp).get('/error-route');
  
  // Restore console.error
  console.error = originalConsoleError;
  
  expect(response.status).to.equal(500);
  expect(response.body).to.have.property('error', 'Internal Server Error');
  expect(response.body).to.have.property('message', 'Test error');
});

  it('seharusnya bisa memparsing body JSON', async () => {
    // Create a new app
    const testApp = express();
    testApp.use(express.json());
    
    // Add a test route that echoes the request body
    testApp.post('/echo', (req, res) => {
      res.json(req.body);
    });
    
    // Now add error handlers
    setupErrorHandlers(testApp);
    
    const testData = { test: 'data', nested: { value: 123 } };
    const response = await request(testApp)
      .post('/echo')
      .send(testData)
      .set('Content-Type', 'application/json');
    
    expect(response.status).to.equal(200);
    expect(response.body).to.deep.equal(testData);
  });

    // Tambahkan di bagian bawah file test, di dalam describe('API Gateway Integration Tests', ...)
  
  it('seharusnya bisa memparsing form-urlencoded', async () => {
    // Create a new app
    const testApp = express();
    testApp.use(express.urlencoded({ extended: true }));
    
    // Add a test route that echoes the request body
    testApp.post('/echo-form', (req, res) => {
      res.json(req.body);
    });
    
    // Now add error handlers
    setupErrorHandlers(testApp);
    
    const response = await request(testApp)
      .post('/echo-form')
      .send('name=test&value=123')
      .set('Content-Type', 'application/x-www-form-urlencoded');
    
    expect(response.status).to.equal(200);
    expect(response.body).to.deep.equal({ name: 'test', value: '123' });
  });
  
  // Import http sehingga kita dapat menggunakan sinon untuk stub listen
  const http = require('http');
  
  it('startServer harus mengembalikan instance server dan menampilkan log', () => {
    // Mock console.log
    const originalLog = console.log;
    console.log = sinon.stub();
    
    // Mock http server object
    const mockServer = { on: sinon.stub() };
    
    // Create a mock app with listen method
    const mockApp = {
      listen: sinon.stub().callsFake((port, callback) => {
        callback(); // Call the callback
        return mockServer; // Return mock server
      })
    };
    
    // Get startServer function
    const { startServer } = proxyquire('../../../index', {
      './routes/auth': authRoutesStub,
      './routes/employee': employeeRoutesStub,
      './routes/payroll': payrollRoutesStub
    });
    
    // Call startServer
    const server = startServer(mockApp, 4000);
    
    // Verify
    expect(server).to.equal(mockServer);
    expect(console.log).to.have.been.calledWith('Gateway server running on port 4000');
    
    // Restore
    console.log = originalLog;
  });
  
  it('createApp dengan opsi default harus menyertakan error handlers', () => {
    // Test secara langsung implementasi createApp
    // withErrorHandlers is true by default, so setupErrorHandlers should be called
    
    // Create an app with default options (no explicit withErrorHandlers)
    const appWithDefaults = createApp();
    
    // Make a request to a non-existent route - should get 404 handler response
    return request(appWithDefaults)
      .get('/non-existent-path-for-testing')
      .then(response => {
        // If error handlers are set up, we should get the custom 404 format
        expect(response.status).to.equal(404);
        expect(response.body).to.have.property('error', 'Not Found');
      });
  });
  
  it('createApp harus memiliki opsi untuk tidak menambahkan error handlers', () => {
    // Import the real module again to avoid interference from other tests
    const { createApp: createAppNoErrorHandlers } = proxyquire('../../../index', {
      './routes/auth': authRoutesStub,
      './routes/employee': employeeRoutesStub,
      './routes/payroll': payrollRoutesStub
    });
    
    // Create app with withErrorHandlers: false
    const appWithoutErrorHandlers = createAppNoErrorHandlers({ withErrorHandlers: false });
    
    // Add a test route so we don't hit 404 immediately
    appWithoutErrorHandlers.get('/test-endpoint', (req, res) => {
      res.json({ success: true });
    });
    
    // Now make request to a non-existent route
    return request(appWithoutErrorHandlers)
      .get('/non-existent-route')
      .then(response => {
        // If error handlers are NOT set up, we should get Express's default
        // behavior, which is NOT a JSON response with error/message fields
        expect(response.status).to.equal(404);
        // Express default format isn't JSON with our custom format
        expect(response.body).to.not.have.property('error', 'Not Found');
      });
  });
  
  it('404 handler harus mengembalikan respons JSON dengan format yang benar', async () => {
    // Create a new app with error handlers
    const appWith404 = createApp({ withErrorHandlers: true });
    
    // Make a request to a non-existent route
    const response = await request(appWith404).get('/non-existent-route');
    
    // Verify the response format
    expect(response.status).to.equal(404);
    expect(response.body).to.deep.equal({
      error: 'Not Found',
      message: 'Route /non-existent-route not found'
    });
  });
});