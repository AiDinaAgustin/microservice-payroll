const express = require('express');
const request = require('supertest');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const proxyquire = require('proxyquire');

// Use sinon-chai for spy assertions
chai.use(sinonChai);
const expect = chai.expect;

describe('Employee Router', () => {
  let app;
  let forwardRequestWithFailoverStub;
  let createProxyMiddlewareStub;
  let handleServiceError;
  const EMPLOYEE_SERVICE_URL = 'http://mock-employee-service';

  beforeEach(() => {
    // Create mocks
    createProxyMiddlewareStub = sinon.stub().returns((req, res, next) => {
      if (res && typeof res.json === 'function') res.json({ proxied: true });
      else if (typeof next === 'function') next();
    });

    forwardRequestWithFailoverStub = sinon.stub();

    // Import employee router with mocked dependencies
    const employeeModule = proxyquire('../../../routes/employee', {
      'http-proxy-middleware': { createProxyMiddleware: createProxyMiddlewareStub },
      '../utils/requestHandler': { forwardRequestWithFailover: forwardRequestWithFailoverStub }
    });

    // Get handleServiceError for branch coverage
    handleServiceError = employeeModule.handleServiceError || (() => {});

    // Create fresh Express app for each test
    app = express();
    app.use(express.json());
    app.use('/v1', employeeModule(EMPLOYEE_SERVICE_URL));
  });

  afterEach(() => {
    sinon.restore();
  });

  // --- Employee routes ---
  it('POST /employees/add calls forwardRequestWithFailover', async () => {
    forwardRequestWithFailoverStub.callsFake((...args) => args[3].status(201).json({ ok: true }));
    const res = await request(app).post('/v1/employees/add').send({ name: 'test' });
    expect(res.status).to.equal(201);
    expect(forwardRequestWithFailoverStub).to.have.been.calledWith(
      EMPLOYEE_SERVICE_URL,
      '/v1/employees/add',
      sinon.match.any,
      sinon.match.any
    );
  });

  it('PUT /employees/edit/:id calls forwardRequestWithFailover', async () => {
    forwardRequestWithFailoverStub.callsFake((...args) => args[3].json({ updated: true }));
    const res = await request(app).put('/v1/employees/edit/1').send({ name: 'edit' });
    expect(res.body).to.deep.equal({ updated: true });
    expect(forwardRequestWithFailoverStub).to.have.been.calledWith(
      EMPLOYEE_SERVICE_URL,
      '/v1/employees/edit/1',
      sinon.match.any,
      sinon.match.any
    );
  });

  it('DELETE /employees/delete/:id calls forwardRequestWithFailover', async () => {
    forwardRequestWithFailoverStub.callsFake((...args) => args[3].json({ deleted: true }));
    const res = await request(app).delete('/v1/employees/delete/1');
    expect(res.body).to.deep.equal({ deleted: true });
    expect(forwardRequestWithFailoverStub).to.have.been.calledWith(
      EMPLOYEE_SERVICE_URL,
      '/v1/employees/delete/1',
      sinon.match.any,
      sinon.match.any
    );
  });

  it('GET /employees/detail/:id calls forwardRequestWithFailover', async () => {
    forwardRequestWithFailoverStub.callsFake((...args) => args[3].json({ id: 1 }));
    const res = await request(app).get('/v1/employees/detail/1');
    expect(res.body).to.deep.equal({ id: 1 });
    expect(forwardRequestWithFailoverStub).to.have.been.calledWith(
      EMPLOYEE_SERVICE_URL,
      '/v1/employees/detail/1',
      sinon.match.any,
      sinon.match.any
    );
  });

  it('GET /employees/list calls forwardRequestWithFailover', async () => {
    forwardRequestWithFailoverStub.callsFake((...args) => args[3].json([{ id: 1 }]));
    const res = await request(app).get('/v1/employees/list');
    expect(res.body).to.deep.equal([{ id: 1 }]);
    expect(forwardRequestWithFailoverStub).to.have.been.calledWith(
      EMPLOYEE_SERVICE_URL,
      '/v1/employees/list',
      sinon.match.any,
      sinon.match.any
    );
  });

  it('GET /employees/options calls forwardRequestWithFailover', async () => {
    forwardRequestWithFailoverStub.callsFake((...args) => args[3].json([{ id: 1 }]));
    const res = await request(app).get('/v1/employees/options');
    expect(res.body).to.deep.equal([{ id: 1 }]);
    expect(forwardRequestWithFailoverStub).to.have.been.calledWith(
      EMPLOYEE_SERVICE_URL,
      '/v1/employees/options',
      sinon.match.any,
      sinon.match.any
    );
  });

  it('PATCH /employees/patch/:id calls forwardRequestWithFailover', async () => {
    forwardRequestWithFailoverStub.callsFake((...args) => args[3].json({ patched: true }));
    const res = await request(app).patch('/v1/employees/patch/1').send({ status: 'active' });
    expect(res.body).to.deep.equal({ patched: true });
    expect(forwardRequestWithFailoverStub).to.have.been.calledWith(
      EMPLOYEE_SERVICE_URL,
      '/v1/employees/patch/1',
      sinon.match.any,
      sinon.match.any
    );
  });

  it('POST /employees/upload calls forwardRequestWithFailover', async () => {
    forwardRequestWithFailoverStub.callsFake((...args) => args[3].json({ uploaded: true }));
    const res = await request(app)
      .post('/v1/employees/upload')
      .attach('file', Buffer.from('test'), 'test.txt');
    expect(res.body).to.deep.equal({ uploaded: true });
    expect(forwardRequestWithFailoverStub).to.have.been.calledWith(
      EMPLOYEE_SERVICE_URL,
      '/v1/employees/upload',
      sinon.match.any,
      sinon.match.any
    );
  });

  it('GET /employees/download calls forwardRequestWithFailover', async () => {
    forwardRequestWithFailoverStub.callsFake((...args) => args[3].json({ downloaded: true }));
    const res = await request(app).get('/v1/employees/download');
    expect(res.body).to.deep.equal({ downloaded: true });
    expect(forwardRequestWithFailoverStub).to.have.been.calledWith(
      EMPLOYEE_SERVICE_URL,
      '/v1/employees/download',
      sinon.match.any,
      sinon.match.any,
      { responseType: 'stream' }
    );
  });

  // --- Organization routes ---
  it('POST /departments/add calls forwardRequestWithFailover', async () => {
    forwardRequestWithFailoverStub.callsFake((...args) => args[3].json({ ok: true }));
    const res = await request(app).post('/v1/departments/add').send({ name: 'test' });
    expect(res.body).to.deep.equal({ ok: true });
    expect(forwardRequestWithFailoverStub).to.have.been.calledWith(
      EMPLOYEE_SERVICE_URL,
      '/v1/departments/add',
      sinon.match.any,
      sinon.match.any
    );
  });

  it('PUT /departments/edit/:id calls forwardRequestWithFailover', async () => {
    forwardRequestWithFailoverStub.callsFake((...args) => args[3].json({ updated: true }));
    const res = await request(app).put('/v1/departments/edit/1').send({ name: 'edit' });
    expect(res.body).to.deep.equal({ updated: true });
    expect(forwardRequestWithFailoverStub).to.have.been.calledWith(
      EMPLOYEE_SERVICE_URL,
      '/v1/departments/edit/1',
      sinon.match.any,
      sinon.match.any
    );
  });

  it('GET /departments/list calls forwardRequestWithFailover', async () => {
    forwardRequestWithFailoverStub.callsFake((...args) => args[3].json([{ id: 1 }]));
    const res = await request(app).get('/v1/departments/list');
    expect(res.body).to.deep.equal([{ id: 1 }]);
    expect(forwardRequestWithFailoverStub).to.have.been.calledWith(
      EMPLOYEE_SERVICE_URL,
      '/v1/departments/list',
      sinon.match.any,
      sinon.match.any
    );
  });

  it('POST /positions/add calls forwardRequestWithFailover', async () => {
    forwardRequestWithFailoverStub.callsFake((...args) => args[3].json({ ok: true }));
    const res = await request(app).post('/v1/positions/add').send({ name: 'test' });
    expect(res.body).to.deep.equal({ ok: true });
    expect(forwardRequestWithFailoverStub).to.have.been.calledWith(
      EMPLOYEE_SERVICE_URL,
      '/v1/positions/add',
      sinon.match.any,
      sinon.match.any
    );
  });

  it('PUT /positions/edit/:id calls forwardRequestWithFailover', async () => {
    forwardRequestWithFailoverStub.callsFake((...args) => args[3].json({ updated: true }));
    const res = await request(app).put('/v1/positions/edit/1').send({ name: 'edit' });
    expect(res.body).to.deep.equal({ updated: true });
    expect(forwardRequestWithFailoverStub).to.have.been.calledWith(
      EMPLOYEE_SERVICE_URL,
      '/v1/positions/edit/1',
      sinon.match.any,
      sinon.match.any
    );
  });

  it('GET /positions/list calls forwardRequestWithFailover', async () => {
    forwardRequestWithFailoverStub.callsFake((...args) => args[3].json([{ id: 1 }]));
    const res = await request(app).get('/v1/positions/list');
    expect(res.body).to.deep.equal([{ id: 1 }]);
    expect(forwardRequestWithFailoverStub).to.have.been.calledWith(
      EMPLOYEE_SERVICE_URL,
      '/v1/positions/list',
      sinon.match.any,
      sinon.match.any
    );
  });

  it('POST /contract-types/add calls forwardRequestWithFailover', async () => {
    forwardRequestWithFailoverStub.callsFake((...args) => args[3].json({ ok: true }));
    const res = await request(app).post('/v1/contract-types/add').send({ name: 'test' });
    expect(res.body).to.deep.equal({ ok: true });
    expect(forwardRequestWithFailoverStub).to.have.been.calledWith(
      EMPLOYEE_SERVICE_URL,
      '/v1/contract-types/add',
      sinon.match.any,
      sinon.match.any
    );
  });

  it('PUT /contract-types/edit/:id calls forwardRequestWithFailover', async () => {
    forwardRequestWithFailoverStub.callsFake((...args) => args[3].json({ updated: true }));
    const res = await request(app).put('/v1/contract-types/edit/1').send({ name: 'edit' });
    expect(res.body).to.deep.equal({ updated: true });
    expect(forwardRequestWithFailoverStub).to.have.been.calledWith(
      EMPLOYEE_SERVICE_URL,
      '/v1/contract-types/edit/1',
      sinon.match.any,
      sinon.match.any
    );
  });

  it('GET /contract-types/list calls forwardRequestWithFailover', async () => {
    forwardRequestWithFailoverStub.callsFake((...args) => args[3].json([{ id: 1 }]));
    const res = await request(app).get('/v1/contract-types/list');
    expect(res.body).to.deep.equal([{ id: 1 }]);
    expect(forwardRequestWithFailoverStub).to.have.been.calledWith(
      EMPLOYEE_SERVICE_URL,
      '/v1/contract-types/list',
      sinon.match.any,
      sinon.match.any
    );
  });

  it('GET /marital-status/list calls forwardRequestWithFailover', async () => {
    forwardRequestWithFailoverStub.callsFake((...args) => args[3].json([{ id: 1 }]));
    const res = await request(app).get('/v1/marital-status/list');
    expect(res.body).to.deep.equal([{ id: 1 }]);
    expect(forwardRequestWithFailoverStub).to.have.been.calledWith(
      EMPLOYEE_SERVICE_URL,
      '/v1/marital-status/list',
      sinon.match.any,
      sinon.match.any
    );
  });

  // --- Proxy fallback routes ---
  it('Proxy fallback for /statuses', async () => {
    const res = await request(app).get('/v1/statuses/anything');
    expect(res.body).to.have.property('proxied', true);
  });

  it('Proxy fallback for /image', async () => {
    const res = await request(app).get('/v1/image/anything');
    expect(res.body).to.have.property('proxied', true);
  });

  it('Proxy fallback for /dashboards', async () => {
    const res = await request(app).get('/v1/dashboards/anything');
    expect(res.body).to.have.property('proxied', true);
  });

  // --- Error handler branch coverage ---
  it('Error handler for /employees/list', async () => {
    forwardRequestWithFailoverStub.throws(new Error('fail'));
    const res = await request(app).get('/v1/employees/list');
    expect(res.status).to.equal(500);
    expect(res.body.error).to.match(/Error communicating with employee service/);
    expect(res.body.details).to.equal('fail');
  });

  it('Error handler for /departments/list', async () => {
    forwardRequestWithFailoverStub.throws(new Error('fail'));
    const res = await request(app).get('/v1/departments/list');
    expect(res.status).to.equal(500);
    expect(res.body.error).to.match(/Error communicating with employee service/);
    expect(res.body.details).to.equal('fail');
  });

  it('Error handler for /positions/list', async () => {
    forwardRequestWithFailoverStub.throws(new Error('fail'));
    const res = await request(app).get('/v1/positions/list');
    expect(res.status).to.equal(500);
    expect(res.body.error).to.match(/Error communicating with employee service/);
    expect(res.body.details).to.equal('fail');
  });

  it('Error handler for /contract-types/list', async () => {
    forwardRequestWithFailoverStub.throws(new Error('fail'));
    const res = await request(app).get('/v1/contract-types/list');
    expect(res.status).to.equal(500);
    expect(res.body.error).to.match(/Error communicating with employee service/);
    expect(res.body.details).to.equal('fail');
  });

  it('Error handler for /marital-status/list', async () => {
    forwardRequestWithFailoverStub.throws(new Error('fail'));
    const res = await request(app).get('/v1/marital-status/list');
    expect(res.status).to.equal(500);
    expect(res.body.error).to.match(/Error communicating with employee service/);
    expect(res.body.details).to.equal('fail');
  });

  // --- handleServiceError branch for headersSent = true ---
  it('handleServiceError does not send response if headersSent', () => {
    const res = { headersSent: true, status: sinon.stub(), json: sinon.stub() };
    const error = new Error('fail');
    handleServiceError(error, res, 'employee');
    expect(res.status).to.not.have.been.called;
    expect(res.json).to.not.have.been.called;
  });

  // --- Proxy onError handler ---
  it('Proxy middleware onError handles error', () => {
    const proxyConfig = createProxyMiddlewareStub.getCall(0).args[0];
    const onErrorHandler = proxyConfig.onError;
    const mockRes = { status: sinon.stub().returnsThis(), json: sinon.stub() };
    const mockError = new Error('Proxy failed');
    onErrorHandler(mockError, {}, mockRes);
    expect(mockRes.status).to.have.been.calledWith(500);
    expect(mockRes.json).to.have.been.calledWith({
      error: 'Error communicating with employee service',
      details: 'Proxy failed'
    });
  });

  it('handleServiceError fallback to "Service unavailable"', () => {
    const res = { headersSent: false, status: sinon.stub().returnsThis(), json: sinon.stub() };
    const error = Object.create(null); // error tanpa .message dan .toString()
    handleServiceError(error, res, 'employee');
    expect(res.status).to.have.been.calledWith(500);
    expect(res.json).to.have.been.calledWith({
      error: 'Error communicating with employee service',
      details: 'Service unavailable'
    });
  });

  // Test error handler for all main organization route groups
  it('Error handler for /departments/add', async () => {
    forwardRequestWithFailoverStub.throws(new Error('fail'));
    const res = await request(app).post('/v1/departments/add').send({ name: 'fail' });
    expect(res.status).to.equal(500);
    expect(res.body.error).to.match(/Error communicating with employee service/);
    expect(res.body.details).to.equal('fail');
  });

  it('Error handler for /departments/edit/:id', async () => {
    forwardRequestWithFailoverStub.throws(new Error('fail'));
    const res = await request(app).put('/v1/departments/edit/1').send({ name: 'fail' });
    expect(res.status).to.equal(500);
    expect(res.body.error).to.match(/Error communicating with employee service/);
    expect(res.body.details).to.equal('fail');
  });

  it('Error handler for /positions/add', async () => {
    forwardRequestWithFailoverStub.throws(new Error('fail'));
    const res = await request(app).post('/v1/positions/add').send({ name: 'fail' });
    expect(res.status).to.equal(500);
    expect(res.body.error).to.match(/Error communicating with employee service/);
    expect(res.body.details).to.equal('fail');
  });

  it('Error handler for /positions/edit/:id', async () => {
    forwardRequestWithFailoverStub.throws(new Error('fail'));
    const res = await request(app).put('/v1/positions/edit/1').send({ name: 'fail' });
    expect(res.status).to.equal(500);
    expect(res.body.error).to.match(/Error communicating with employee service/);
    expect(res.body.details).to.equal('fail');
  });

  it('Error handler for /contract-types/add', async () => {
    forwardRequestWithFailoverStub.throws(new Error('fail'));
    const res = await request(app).post('/v1/contract-types/add').send({ name: 'fail' });
    expect(res.status).to.equal(500);
    expect(res.body.error).to.match(/Error communicating with employee service/);
    expect(res.body.details).to.equal('fail');
  });

  it('Error handler for /contract-types/edit/:id', async () => {
    forwardRequestWithFailoverStub.throws(new Error('fail'));
    const res = await request(app).put('/v1/contract-types/edit/1').send({ name: 'fail' });
    expect(res.status).to.equal(500);
    expect(res.body.error).to.match(/Error communicating with employee service/);
    expect(res.body.details).to.equal('fail');
  });

  it('Error handler for /employees/upload', async () => {
    forwardRequestWithFailoverStub.throws(new Error('fail'));
    const res = await request(app)
      .post('/v1/employees/upload')
      .attach('file', Buffer.from('test'), 'test.txt');
    expect(res.status).to.equal(500);
    expect(res.body.error).to.match(/Error communicating with employee service/);
    expect(res.body.details).to.equal('fail');
  });

  it('Error handler for /employees/download', async () => {
    forwardRequestWithFailoverStub.throws(new Error('fail'));
    const res = await request(app).get('/v1/employees/download');
    expect(res.status).to.equal(500);
    expect(res.body.error).to.match(/Error communicating with employee service/);
    expect(res.body.details).to.equal('fail');
  });

  it('handleServiceError uses error.toString() if no message', () => {
    const res = { headersSent: false, status: sinon.stub().returnsThis(), json: sinon.stub() };
    const error = { toString: () => 'string error' };
    handleServiceError(error, res, 'employee');
    expect(res.status).to.have.been.calledWith(500);
    expect(res.json).to.have.been.calledWith({
      error: 'Error communicating with employee service',
      details: 'string error'
    });
  });

  it('Proxy middleware onError uses err.toString() if no message', () => {
    const proxyConfig = createProxyMiddlewareStub.getCall(0).args[0];
    const onErrorHandler = proxyConfig.onError;
    const mockRes = { status: sinon.stub().returnsThis(), json: sinon.stub() };
    const err = { toString: () => 'string error' };
    onErrorHandler(err, {}, mockRes);
    expect(mockRes.status).to.have.been.calledWith(500);
    expect(mockRes.json).to.have.been.calledWith({
      error: 'Error communicating with employee service',
      details: 'string error'
    });
  });
});