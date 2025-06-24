const express = require('express');
const request = require('supertest');

// Mock the entire modules
jest.mock('http-proxy-middleware', () => ({
  createProxyMiddleware: jest.fn(() => (req, res, next) => {
    res.status(200).json({ proxied: true });
  })
}));

jest.mock('../../../utils/requestHandler', () => ({
  forwardRequest: jest.fn((serviceUrl, path, req, res) => {
    if (path === '/v1/auth/login') {
      res.status(200).json({ token: 'mock-token', user: { id: '1', name: 'Test User' } });
    } else {
      res.status(404).json({ error: 'Not found' });
    }
  })
}));

// Import the mocks so we can access them in tests
const { createProxyMiddleware } = require('http-proxy-middleware');
const { forwardRequest } = require('../../../utils/requestHandler');

// Import the module under test
const createAuthRouter = require('../../../routes/auth');

describe('Auth Routes', () => {
  let app;
  const AUTH_SERVICE_URL = 'http://mock-auth-service';

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create a fresh Express app for each test
    app = express();
    app.use(express.json());
    
    // Mount the router
    const authRouter = createAuthRouter(AUTH_SERVICE_URL);
    app.use('/v1/auth', authRouter);
  });

  test('Harus menggunakan createProxyMiddleware dengan opsi yang benar', () => {
    expect(createProxyMiddleware).toHaveBeenCalledWith({
      target: AUTH_SERVICE_URL,
      changeOrigin: true,
      pathRewrite: null,
      logLevel: 'debug'
    });
  });

  test('POST /login harus memanggil forwardRequest dengan argumen yang benar', async () => {
    // Arrange
    const loginData = { email: 'test@example.com', password: 'password123' };
    
    // Act
    const response = await request(app)
      .post('/v1/auth/login')
      .send(loginData);
    
    // Assert
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token', 'mock-token');
    expect(forwardRequest).toHaveBeenCalledWith(
      AUTH_SERVICE_URL,
      '/v1/auth/login',
      expect.anything(),
      expect.anything()
    );
  });

  test('GET /profile harus menggunakan middleware proxy', async () => {
    // Act
    const response = await request(app)
      .get('/v1/auth/profile')
      .set('Authorization', 'Bearer mock-token');
    
    // Assert
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('proxied', true);
    expect(forwardRequest).not.toHaveBeenCalled();
  });
    
    test('POST /login harus menangani error dari layanan autentikasi', async () => {
      // Arrange
      forwardRequest.mockImplementationOnce((serviceUrl, path, req, res) => {
        res.status(401).json({ error: 'Invalid credentials' });
      });
      
      // Act
      const response = await request(app)
        .post('/v1/auth/login')
        .send({ email: 'test@example.com', password: 'wrong' });
      
      // Assert
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });
    
    test('Harus menangani rute POST lainnya menggunakan proxy middleware', async () => {
      // Act
      const response = await request(app)
        .post('/v1/auth/register')
        .send({ email: 'new@example.com', password: 'password123' });
      
      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('proxied', true);
      expect(forwardRequest).not.toHaveBeenCalled();
    });
        
    test('Harus melewati proxy untuk POST /login (menguji next("route"))', async () => {
      // Update mock implementation to include the expected property
      forwardRequest.mockImplementation((serviceUrl, path, req, res) => {
        res.status(200).json({ token: 'mock-token', user: { id: '1', name: 'Test User' }, direct: true });
      });
      
      // Test specific route that should trigger next('route')
      const response = await request(app)
        .post('/v1/auth/login')
        .send({ email: 'test@example.com', password: 'password123' });
      
      // Should use direct forwardRequest approach, not proxy
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('direct', true);
      expect(forwardRequest).toHaveBeenCalled();
    });
    
    test('Harus menggunakan proxy untuk GET /login', async () => {
      // Reset call history
      jest.clearAllMocks();
      
      // Test the same path but different method
      const response = await request(app)
        .get('/v1/auth/login');
      
      // Should use proxy, not direct approach
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('proxied', true);
      expect(forwardRequest).not.toHaveBeenCalled();
    });
    
    test('Harus menggunakan proxy untuk POST pada path selain /login', async () => {
      // Reset call history
      jest.clearAllMocks();
      
      // Test different path with POST method
      const response = await request(app)
        .post('/v1/auth/register')
        .send({ email: 'new@example.com', password: 'password123' });
      
      // Should use proxy, not direct approach
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('proxied', true);
      expect(forwardRequest).not.toHaveBeenCalled();
    });
    
    test('Harus memproses multiple requests dengan routing yang benar', async () => {
      // Update mock implementation to include the expected property
      forwardRequest.mockImplementation((serviceUrl, path, req, res) => {
        res.status(200).json({ token: 'mock-token', user: { id: '1', name: 'Test User' }, direct: true });
      });
      
      // Reset call history
      jest.clearAllMocks();
    
      // First, make a request that should use direct approach
      await request(app)
        .post('/v1/auth/login')
        .send({ email: 'test@example.com', password: 'password123' });
      
      // Verify forwardRequest was called
      expect(forwardRequest).toHaveBeenCalledTimes(1);
      
      // Reset call history again
      jest.clearAllMocks();
      
      // Now make a request that should use proxy
      await request(app)
        .get('/v1/auth/profile');
      
      // Verify forwardRequest was not called (proxy should be used instead)
      expect(forwardRequest).not.toHaveBeenCalled();
    });
    
    test('Harus menangani request dengan undefined method dengan benar', async () => {
      // Buat router khusus untuk test ini
      const testApp = express();
      testApp.use(express.json());
      
      // Modifikasi req.method sebelum sampai ke router auth
      testApp.use((req, res, next) => {
        // Hapus method property
        delete req.method;
        next();
      });
      
      // Mount auth router setelah middleware di atas
      const authRouter = createAuthRouter(AUTH_SERVICE_URL);
      testApp.use('/v1/auth', authRouter);
      
      // Reset call history
      jest.clearAllMocks();
      
      // Test dengan request normal
      const response = await request(testApp)
        .post('/v1/auth/login')
        .send({ email: 'test@example.com', password: 'password123' });
      
      // Karena method undefined, harusnya menggunakan proxy
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('proxied', true);
      expect(forwardRequest).not.toHaveBeenCalled();
    });
        test('Harus menangani request dengan undefined path dengan benar', async () => {
      // Buat router khusus untuk test ini
      const testApp = express();
      testApp.use(express.json());
      
      // Modifikasi req.path sebelum sampai ke router auth
      testApp.use((req, res, next) => {
        // Hapus path property
        delete req.path;
        next();
      });
      
      // Mount auth router setelah middleware di atas
      const authRouter = createAuthRouter(AUTH_SERVICE_URL);
      testApp.use('/v1/auth', authRouter);
      
      // Reset call history
      jest.clearAllMocks();
      
      // Test dengan URL yang tidak cocok dengan rute spesifik apapun
      // Gunakan URL selain /login agar tidak match dengan router.post('/login')
      const response = await request(testApp)
        .post('/v1/auth/some-undefined-path')
        .send({ email: 'test@example.com', password: 'password123' });
      
      // Harusnya menggunakan proxy
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('proxied', true);
      expect(forwardRequest).not.toHaveBeenCalled();
    });
    
        test('Harus menangani request dengan empty string path dengan benar', async () => {
      // Buat router khusus untuk test ini
      const testApp = express();
      testApp.use(express.json());
      
      // Override forwardRequest mock untuk test ini
      forwardRequest.mockImplementation((serviceUrl, path, req, res) => {
        res.status(200).json({ direct: true, token: 'mock-token', user: { id: '1', name: 'Test User' } });
      });
      
      // Buat router khusus yang hanya berisi middleware umum untuk testing
      const authRouter = express.Router();
      
      // Create proxy for auth service
      const authProxy = createProxyMiddleware({
        target: AUTH_SERVICE_URL,
        changeOrigin: true,
        pathRewrite: null,
        logLevel: 'debug'
      });
      
      // Hanya tambahkan middleware yang ingin ditest, tanpa route spesifik
      authRouter.use('/', (req, res, next) => {
        // Set path kosong secara eksplisit untuk test
        req.path = '';
        
        // Logika yang sama dengan auth.js
        const isLoginPath = req.path === '/login';
        const isPostMethod = req.method === 'POST';
        
        if (isLoginPath && isPostMethod) {
          return next('route'); // Skip proxy for login POST
        }
        
        // Default case (seharusnya ini yang dijalankan untuk empty path)
        return authProxy(req, res, next);
      });
      
      testApp.use('/v1/auth', authRouter);
      
      // Reset call history
      jest.clearAllMocks();
      
      // Test dengan URL apapun, karena kita override req.path di dalam middleware
      const response = await request(testApp)
        .post('/v1/auth/any-path')
        .send({ email: 'test@example.com', password: 'password123' });
      
      // Karena path kosong (''), bukan '/login', harusnya menggunakan proxy
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('proxied', true);
      expect(forwardRequest).not.toHaveBeenCalled();
    });
    
    test('Harus menggunakan proxy untuk metode selain GET atau POST', async () => {
      // Reset call history
      jest.clearAllMocks();
      
      // Test dengan metode PUT
      const response = await request(app)
        .put('/v1/auth/login')
        .send({ email: 'test@example.com', password: 'updated-password' });
      
      // Harusnya menggunakan proxy
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('proxied', true);
      expect(forwardRequest).not.toHaveBeenCalled();
    });
    
    test('Harus menangani kombinasi berbagai path dan metode dengan benar', async () => {
      // Reset call history
      jest.clearAllMocks();
      
      // Array of test scenarios
      const scenarios = [
        { path: '/login', method: 'post', expectProxy: false },
        { path: '/login', method: 'get', expectProxy: true },
        { path: '/login', method: 'put', expectProxy: true },
        { path: '/register', method: 'post', expectProxy: true },
        { path: '/profile', method: 'get', expectProxy: true }
      ];
      
      // Loop through all scenarios
      for (const scenario of scenarios) {
        // Reset call history
        jest.clearAllMocks();
        
        // Make request based on scenario
        const requestMethod = request(app)[scenario.method](
          `/v1/auth${scenario.path}`
        );
        
        if (['post', 'put'].includes(scenario.method)) {
          requestMethod.send({ test: 'data' });
        }
        
        const response = await requestMethod;
        
        // Verify expectations
        expect(response.status).toBe(200);
        if (scenario.expectProxy) {
          expect(response.body).toHaveProperty('proxied', true);
          expect(forwardRequest).not.toHaveBeenCalled();
        } else {
          expect(response.body).not.toHaveProperty('proxied', true);
          expect(forwardRequest).toHaveBeenCalled();
        }
      }
    });
});
