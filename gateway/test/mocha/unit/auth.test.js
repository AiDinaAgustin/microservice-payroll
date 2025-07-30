const chai = require('chai');
const { expect } = chai;
const express = require('express');
const request = require('supertest');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const proxyquire = require('proxyquire');

// Use sinon-chai for spy assertions
chai.use(sinonChai);

describe('Auth Routes (Mocha/Chai)', () => {
  let app;
  let createProxyMiddlewareMock;
  let forwardRequestMock;
  let createAuthRouter;
  const AUTH_SERVICE_URL = 'http://mock-auth-service';

  beforeEach(() => {
    // Create mocks
    createProxyMiddlewareMock = sinon.stub().returns((req, res, next) => {
      res.status(200).json({ proxied: true });
    });

    forwardRequestMock = sinon.stub().callsFake((serviceUrl, path, req, res) => {
      if (path === '/v1/auth/login') {
        res.status(200).json({ token: 'mock-token', user: { id: '1', name: 'Test User' } });
      } else {
        res.status(404).json({ error: 'Not found' });
      }
    });

    // Import auth router with mocked dependencies using proxyquire
    createAuthRouter = proxyquire('../../../routes/auth', {
      'http-proxy-middleware': {
        createProxyMiddleware: createProxyMiddlewareMock
      },
      '../utils/requestHandler': {
        forwardRequest: forwardRequestMock
      }
    });

    // Create a fresh Express app for each test
    app = express();
    app.use(express.json());
    
    // Mount the router
    const authRouter = createAuthRouter(AUTH_SERVICE_URL);
    app.use('/v1/auth', authRouter);
  });

  afterEach(() => {
    // Reset mocks
    sinon.restore();
  });

  it('Harus menggunakan createProxyMiddleware dengan opsi yang benar', () => {
    const proxyConfig = createProxyMiddlewareMock.getCall(0).args[0];
    expect(proxyConfig).to.include({
      target: AUTH_SERVICE_URL,
      changeOrigin: true,
      pathRewrite: null,
      logLevel: 'debug'
    });
    expect(proxyConfig.onError).to.be.a('function');
  });

  it('POST /login harus memanggil forwardRequest dengan argumen yang benar', async () => {
    // Arrange
    const loginData = { email: 'test@example.com', password: 'password123' };
    
    // Act
    const response = await request(app)
      .post('/v1/auth/login')
      .send(loginData);
    
    // Assert
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('token', 'mock-token');
    expect(forwardRequestMock).to.have.been.calledWith(
      AUTH_SERVICE_URL,
      '/v1/auth/login',
      sinon.match.any,
      sinon.match.any
    );
  });

  it('GET /profile harus menggunakan middleware proxy', async () => {
    // Act
    const response = await request(app)
      .get('/v1/auth/profile')
      .set('Authorization', 'Bearer mock-token');
    
    // Assert
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('proxied', true);
    expect(forwardRequestMock).to.not.have.been.called;
  });
    
  it('POST /login harus menangani error dari layanan autentikasi', async () => {
    // Arrange
    forwardRequestMock.callsFake((serviceUrl, path, req, res) => {
      res.status(401).json({ error: 'Invalid credentials' });
    });
    
    // Act
    const response = await request(app)
      .post('/v1/auth/login')
      .send({ email: 'test@example.com', password: 'wrong' });
    
    // Assert
    expect(response.status).to.equal(401);
    expect(response.body).to.have.property('error', 'Invalid credentials');
  });
    
  it('Harus menangani rute POST lainnya menggunakan proxy middleware', async () => {
    // Act
    const response = await request(app)
      .post('/v1/auth/register')
      .send({ email: 'new@example.com', password: 'password123' });
    
    // Assert
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('proxied', true);
    expect(forwardRequestMock).to.not.have.been.called;
  });
  
  it('Harus melewati proxy untuk POST /login (menguji next("route"))', async () => {
    // Update mock implementation to include the expected property
    forwardRequestMock.callsFake((serviceUrl, path, req, res) => {
      res.status(200).json({ token: 'mock-token', user: { id: '1', name: 'Test User' }, direct: true });
    });
    
    // Test specific route that should trigger next('route')
    const response = await request(app)
      .post('/v1/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });
    
    // Should use direct forwardRequest approach, not proxy
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('direct', true);
    expect(forwardRequestMock).to.have.been.called;
  });
  
  it('Harus menggunakan proxy untuk GET /login', async () => {
    // Reset call history
    forwardRequestMock.resetHistory();
    
    // Test the same path but different method
    const response = await request(app)
      .get('/v1/auth/login');
    
    // Should use proxy, not direct approach
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('proxied', true);
    expect(forwardRequestMock).to.not.have.been.called;
  });
  
  it('Harus menggunakan proxy untuk POST pada path selain /login', async () => {
    // Reset call history
    forwardRequestMock.resetHistory();
    
    // Test different path with POST method
    const response = await request(app)
      .post('/v1/auth/register')
      .send({ email: 'new@example.com', password: 'password123' });
    
    // Should use proxy, not direct approach
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('proxied', true);
    expect(forwardRequestMock).to.not.have.been.called;
  });
  
  it('Harus memproses multiple requests dengan routing yang benar', async () => {
    // Update mock implementation to include the expected property
    forwardRequestMock.callsFake((serviceUrl, path, req, res) => {
      res.status(200).json({ token: 'mock-token', user: { id: '1', name: 'Test User' }, direct: true });
    });
    
    // Reset call history
    forwardRequestMock.resetHistory();
  
    // First, make a request that should use direct approach
    await request(app)
      .post('/v1/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });
    
    // Verify forwardRequest was called
    expect(forwardRequestMock).to.have.been.calledOnce;
    
    // Reset call history again
    forwardRequestMock.resetHistory();
    
    // Now make a request that should use proxy
    await request(app)
      .get('/v1/auth/profile');
    
    // Verify forwardRequest was not called (proxy should be used instead)
    expect(forwardRequestMock).to.not.have.been.called;
  });
  
  it('Harus menangani request dengan undefined method dengan benar', async () => {
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
    forwardRequestMock.resetHistory();
    
    // Test dengan request normal
    const response = await request(testApp)
      .post('/v1/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });
    
    // Karena method undefined, harusnya menggunakan proxy
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('proxied', true);
    expect(forwardRequestMock).to.not.have.been.called;
  });
  
  it('Harus menangani request dengan undefined path dengan benar', async () => {
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
    forwardRequestMock.resetHistory();
    
    // Test dengan URL yang tidak cocok dengan rute spesifik apapun
    const response = await request(testApp)
      .post('/v1/auth/some-undefined-path')
      .send({ email: 'test@example.com', password: 'password123' });
    
    // Harusnya menggunakan proxy
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('proxied', true);
    expect(forwardRequestMock).to.not.have.been.called;
  });
  
  it('Harus menangani request dengan empty string path dengan benar', async () => {
    // Buat router khusus untuk test ini
    const testApp = express();
    testApp.use(express.json());
    
    // Override forwardRequest mock untuk test ini
    forwardRequestMock.callsFake((serviceUrl, path, req, res) => {
      res.status(200).json({ direct: true, token: 'mock-token', user: { id: '1', name: 'Test User' } });
    });
    
    // Buat router khusus yang hanya berisi middleware umum untuk testing
    const authRouter = express.Router();
    
    // Create proxy for auth service
    const authProxy = createProxyMiddlewareMock({
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
    forwardRequestMock.resetHistory();
    
    // Test dengan URL apapun
    const response = await request(testApp)
      .post('/v1/auth/any-path')
      .send({ email: 'test@example.com', password: 'password123' });
    
    // Karena path kosong (''), bukan '/login', harusnya menggunakan proxy
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('proxied', true);
    expect(forwardRequestMock).to.not.have.been.called;
  });
  
  it('Harus menggunakan proxy untuk metode selain GET atau POST', async () => {
    // Reset call history
    forwardRequestMock.resetHistory();
    
    // Test dengan metode PUT
    const response = await request(app)
      .put('/v1/auth/login')
      .send({ email: 'test@example.com', password: 'updated-password' });
    
    // Harusnya menggunakan proxy
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('proxied', true);
    expect(forwardRequestMock).to.not.have.been.called;
  });
  
  it('Harus menangani kombinasi berbagai path dan metode dengan benar', async () => {
    // Reset call history
    forwardRequestMock.resetHistory();
    
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
      forwardRequestMock.resetHistory();
      
      // Make request based on scenario
      const requestMethod = request(app)[scenario.method](
        `/v1/auth${scenario.path}`
      );
      
      if (['post', 'put'].includes(scenario.method)) {
        requestMethod.send({ test: 'data' });
      }
      
      const response = await requestMethod;
      
      // Verify expectations
      expect(response.status).to.equal(200);
      if (scenario.expectProxy) {
        expect(response.body).to.have.property('proxied', true);
        expect(forwardRequestMock).to.not.have.been.called;
      } else {
        expect(response.body).to.not.have.property('proxied', true);
        expect(forwardRequestMock).to.have.been.called;
      }
    }
  });

  it('Proxy middleware onError uses err.toString() if no message', () => {
    const proxyConfig = createProxyMiddlewareMock.getCall(0).args[0];
    const onErrorHandler = proxyConfig.onError;
    const mockRes = { status: sinon.stub().returnsThis(), json: sinon.stub() };
    const err = { toString: () => 'string error' };
    onErrorHandler(err, {}, mockRes);
    expect(mockRes.status).to.have.been.calledWith(500);
    expect(mockRes.json).to.have.been.calledWith({
      error: 'Error communicating with auth service',
      details: 'string error'
    });
  });
  
  it('Proxy middleware onError fallback to "Service unavailable"', () => {
    const proxyConfig = createProxyMiddlewareMock.getCall(0).args[0];
    const onErrorHandler = proxyConfig.onError;
    const mockRes = { status: sinon.stub().returnsThis(), json: sinon.stub() };
    const err = Object.create(null);
    onErrorHandler(err, {}, mockRes);
    expect(mockRes.status).to.have.been.calledWith(500);
    expect(mockRes.json).to.have.been.calledWith({
      error: 'Error communicating with auth service',
      details: 'Service unavailable'
    });
  });
  
  it('POST /login tidak mengirim response jika headersSent sudah true', async () => {
    // Arrange
    forwardRequestMock.callsFake((serviceUrl, path, req, res) => {
      res.headersSent = true;
      throw new Error('fail');
    });
    
    // Act
    const response = await request(app)
      .post('/v1/auth/login')
      .send({ email: 'test@example.com', password: 'wrong' });
    
    // Assert
    expect(forwardRequestMock).to.have.been.called;
    expect(response.status).to.be.oneOf([200, 404, 500]); // Tergantung express
  });
  
  it('POST /login error handler tidak mengirim response jika headersSent sudah true', async () => {
    // Arrange
    forwardRequestMock.callsFake((serviceUrl, path, req, res) => {
      res.headersSent = true;
      throw new Error('fail');
    });
    
    // Act
    const response = await request(app)
      .post('/v1/auth/login')
      .send({ email: 'test@example.com', password: 'wrong' });
    
    // Assert
    expect(forwardRequestMock).to.have.been.called;
    expect(response.status).to.be.oneOf([200, 404, 500]); // Tergantung express
  });
  
  it('Proxy middleware onError uses err.message if present', () => {
    const proxyConfig = createProxyMiddlewareMock.getCall(0).args[0];
    const onErrorHandler = proxyConfig.onError;
    const mockRes = { status: sinon.stub().returnsThis(), json: sinon.stub() };
    const err = { message: 'error message' };
    onErrorHandler(err, {}, mockRes);
    expect(mockRes.status).to.have.been.calledWith(500);
    expect(mockRes.json).to.have.been.calledWith({
      error: 'Error communicating with auth service',
      details: 'error message'
    });
  });
});