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
});
