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
    expect(createProxyMiddlewareMock).to.have.been.calledWith({
      target: AUTH_SERVICE_URL,
      changeOrigin: true,
      pathRewrite: null,
      logLevel: 'debug'
    });
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
    // We can't directly test that the proxy wasn't called since we don't have a reference to it
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
});