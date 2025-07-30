const express = require('express');
const request = require('supertest');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const proxyquire = require('proxyquire');

// Use sinon-chai for spy assertions
chai.use(sinonChai);
const expect = chai.expect;

describe('Payroll Router', () => {
  let app;
  let forwardRequestStub;
  let createProxyMiddlewareStub;
  let handleServiceError;
  const PAYROLL_SERVICE_URL = 'http://mock-payroll-service';

  beforeEach(() => {
    // Create mocks
    createProxyMiddlewareStub = sinon.stub().returns((req, res, next) => {
      if (res && typeof res.status === 'function') {
        res.status(200).json({ proxied: true });
      } else if (typeof next === 'function') {
        next();
      }
    });

    forwardRequestStub = sinon.stub();

    // Import payroll router with mocked dependencies
    const payrollModule = proxyquire('../../../routes/payroll', {
      'http-proxy-middleware': { createProxyMiddleware: createProxyMiddlewareStub },
      '../utils/requestHandler': { forwardRequest: forwardRequestStub }
    });

    // Get handleServiceError for branch coverage
    handleServiceError = payrollModule.handleServiceError || (() => {});

    // Create fresh Express app for each test
    app = express();
    app.use(express.json());
    app.use('/v1', payrollModule(PAYROLL_SERVICE_URL));
  });

  afterEach(() => {
    sinon.restore();
  });

  // Salary routes
  it('POST /salaries/add calls forwardRequest', async () => {
    forwardRequestStub.callsFake((...args) => args[3].status(201).json({ ok: true }));
    const res = await request(app).post('/v1/salaries/add').send({ name: 'test' });
    expect(res.status).to.equal(201);
    expect(forwardRequestStub).to.have.been.calledWith(
      PAYROLL_SERVICE_URL,
      '/v1/salaries/add',
      sinon.match.any,
      sinon.match.any
    );
  });

  it('GET /salaries/list calls forwardRequest', async () => {
    forwardRequestStub.callsFake((...args) => args[3].json([{ id: 1 }]));
    const res = await request(app).get('/v1/salaries/list');
    expect(res.body).to.deep.equal([{ id: 1 }]);
    expect(forwardRequestStub).to.have.been.calledWith(
      PAYROLL_SERVICE_URL,
      '/v1/salaries/list',
      sinon.match.any,
      sinon.match.any
    );
  });

  it('GET /salaries/detail/:id calls forwardRequest', async () => {
    forwardRequestStub.callsFake((...args) => args[3].json({ id: 1 }));
    const res = await request(app).get('/v1/salaries/detail/1');
    expect(res.body).to.deep.equal({ id: 1 });
    expect(forwardRequestStub).to.have.been.calledWith(
      PAYROLL_SERVICE_URL,
      '/v1/salaries/detail/1',
      sinon.match.any,
      sinon.match.any
    );
  });

  it('PUT /salaries/edit/:id calls forwardRequest', async () => {
    forwardRequestStub.callsFake((...args) => args[3].json({ updated: true }));
    const res = await request(app).put('/v1/salaries/edit/1').send({ name: 'edit' });
    expect(res.body).to.deep.equal({ updated: true });
    expect(forwardRequestStub).to.have.been.calledWith(
      PAYROLL_SERVICE_URL,
      '/v1/salaries/edit/1',
      sinon.match.any,
      sinon.match.any
    );
  });

  it('DELETE /salaries/delete/:id calls forwardRequest', async () => {
    forwardRequestStub.callsFake((...args) => args[3].json({ deleted: true }));
    const res = await request(app).delete('/v1/salaries/delete/1');
    expect(res.body).to.deep.equal({ deleted: true });
    expect(forwardRequestStub).to.have.been.calledWith(
      PAYROLL_SERVICE_URL,
      '/v1/salaries/delete/1',
      sinon.match.any,
      sinon.match.any
    );
  });

  // Attendance routes
  it('POST /attendances/add calls forwardRequest', async () => {
    forwardRequestStub.callsFake((...args) => args[3].json({ ok: true }));
    const res = await request(app).post('/v1/attendances/add').send({ name: 'test' });
    expect(res.body).to.deep.equal({ ok: true });
    expect(forwardRequestStub).to.have.been.calledWith(
      PAYROLL_SERVICE_URL,
      '/v1/attendances/add',
      sinon.match.any,
      sinon.match.any
    );
  });

  it('GET /attendances/list calls forwardRequest', async () => {
    forwardRequestStub.callsFake((...args) => args[3].json([{ id: 1 }]));
    const res = await request(app).get('/v1/attendances/list');
    expect(res.body).to.deep.equal([{ id: 1 }]);
    expect(forwardRequestStub).to.have.been.calledWith(
      PAYROLL_SERVICE_URL,
      '/v1/attendances/list',
      sinon.match.any,
      sinon.match.any
    );
  });

  it('GET /attendances/detail/:id calls forwardRequest', async () => {
    forwardRequestStub.callsFake((...args) => args[3].json({ id: 1 }));
    const res = await request(app).get('/v1/attendances/detail/1');
    expect(res.body).to.deep.equal({ id: 1 });
    expect(forwardRequestStub).to.have.been.calledWith(
      PAYROLL_SERVICE_URL,
      '/v1/attendances/detail/1',
      sinon.match.any,
      sinon.match.any
    );
  });

  it('PUT /attendances/edit/:id calls forwardRequest', async () => {
    forwardRequestStub.callsFake((...args) => args[3].json({ updated: true }));
    const res = await request(app).put('/v1/attendances/edit/1').send({ name: 'edit' });
    expect(res.body).to.deep.equal({ updated: true });
    expect(forwardRequestStub).to.have.been.calledWith(
      PAYROLL_SERVICE_URL,
      '/v1/attendances/edit/1',
      sinon.match.any,
      sinon.match.any
    );
  });

  it('DELETE /attendances/delete/:id calls forwardRequest', async () => {
    forwardRequestStub.callsFake((...args) => args[3].json({ deleted: true }));
    const res = await request(app).delete('/v1/attendances/delete/1');
    expect(res.body).to.deep.equal({ deleted: true });
    expect(forwardRequestStub).to.have.been.calledWith(
      PAYROLL_SERVICE_URL,
      '/v1/attendances/delete/1',
      sinon.match.any,
      sinon.match.any
    );
  });

  // Attendance deduction routes
  it('POST /attendance-deductions/calculate calls forwardRequest', async () => {
    forwardRequestStub.callsFake((...args) => args[3].json({ ok: true }));
    const res = await request(app).post('/v1/attendance-deductions/calculate').send({ name: 'test' });
    expect(res.body).to.deep.equal({ ok: true });
    expect(forwardRequestStub).to.have.been.calledWith(
      PAYROLL_SERVICE_URL,
      '/v1/attendance-deductions/calculate',
      sinon.match.any,
      sinon.match.any
    );
  });

  it('POST /attendance-deductions/generate calls forwardRequest', async () => {
    forwardRequestStub.callsFake((...args) => args[3].json({ ok: true }));
    const res = await request(app).post('/v1/attendance-deductions/generate').send({ name: 'test' });
    expect(res.body).to.deep.equal({ ok: true });
    expect(forwardRequestStub).to.have.been.calledWith(
      PAYROLL_SERVICE_URL,
      '/v1/attendance-deductions/generate',
      sinon.match.any,
      sinon.match.any
    );
  });

  it('GET /attendance-deductions/list calls forwardRequest', async () => {
    forwardRequestStub.callsFake((...args) => args[3].json([{ id: 1 }]));
    const res = await request(app).get('/v1/attendance-deductions/list');
    expect(res.body).to.deep.equal([{ id: 1 }]);
    expect(forwardRequestStub).to.have.been.calledWith(
      PAYROLL_SERVICE_URL,
      '/v1/attendance-deductions/list',
      sinon.match.any,
      sinon.match.any
    );
  });

  it('GET /attendance-deductions/detail/:id calls forwardRequest', async () => {
    forwardRequestStub.callsFake((...args) => args[3].json({ id: 1 }));
    const res = await request(app).get('/v1/attendance-deductions/detail/1');
    expect(res.body).to.deep.equal({ id: 1 });
    expect(forwardRequestStub).to.have.been.calledWith(
      PAYROLL_SERVICE_URL,
      '/v1/attendance-deductions/detail/1',
      sinon.match.any,
      sinon.match.any
    );
  });

  it('DELETE /attendance-deductions/delete/:id calls forwardRequest', async () => {
    forwardRequestStub.callsFake((...args) => args[3].json({ deleted: true }));
    const res = await request(app).delete('/v1/attendance-deductions/delete/1');
    expect(res.body).to.deep.equal({ deleted: true });
    expect(forwardRequestStub).to.have.been.calledWith(
      PAYROLL_SERVICE_URL,
      '/v1/attendance-deductions/delete/1',
      sinon.match.any,
      sinon.match.any
    );
  });

  // Payslip routes
  it('POST /payslips/add calls forwardRequest', async () => {
    forwardRequestStub.callsFake((...args) => args[3].json({ ok: true }));
    const res = await request(app).post('/v1/payslips/add').send({ name: 'test' });
    expect(res.body).to.deep.equal({ ok: true });
    expect(forwardRequestStub).to.have.been.calledWith(
      PAYROLL_SERVICE_URL,
      '/v1/payslips/add',
      sinon.match.any,
      sinon.match.any
    );
  });

  it('POST /payslips/generate calls forwardRequest', async () => {
    forwardRequestStub.callsFake((...args) => args[3].json({ ok: true }));
    const res = await request(app).post('/v1/payslips/generate').send({ name: 'test' });
    expect(res.body).to.deep.equal({ ok: true });
    expect(forwardRequestStub).to.have.been.calledWith(
      PAYROLL_SERVICE_URL,
      '/v1/payslips/generate',
      sinon.match.any,
      sinon.match.any
    );
  });

  it('GET /payslips/list calls forwardRequest', async () => {
    forwardRequestStub.callsFake((...args) => args[3].json([{ id: 1 }]));
    const res = await request(app).get('/v1/payslips/list');
    expect(res.body).to.deep.equal([{ id: 1 }]);
    expect(forwardRequestStub).to.have.been.calledWith(
      PAYROLL_SERVICE_URL,
      '/v1/payslips/list',
      sinon.match.any,
      sinon.match.any
    );
  });

  it('GET /payslips/detail/:id calls forwardRequest', async () => {
    forwardRequestStub.callsFake((...args) => args[3].json({ id: 1 }));
    const res = await request(app).get('/v1/payslips/detail/1');
    expect(res.body).to.deep.equal({ id: 1 });
    expect(forwardRequestStub).to.have.been.calledWith(
      PAYROLL_SERVICE_URL,
      '/v1/payslips/detail/1',
      sinon.match.any,
      sinon.match.any
    );
  });

  // Error handling test
  it('Handles error in forwardRequest', async () => {
    forwardRequestStub.throws(new Error('fail'));
    const res = await request(app).post('/v1/salaries/add').send({ name: 'test' });
    expect(res.status).to.equal(500);
    expect(res.body.error).to.match(/Error communicating with payroll service/);
  });

  // Proxy fallback test (improve for coverage)
  it('Proxy fallback for /salaries', () => {
    const proxyConfig = createProxyMiddlewareStub.getCall(0).args[0];
    const onError = proxyConfig.onError;
    const err = new Error('proxy error');
    const jsonMock = sinon.stub();
    const statusMock = sinon.stub().returns({ json: jsonMock });
    const res = { status: statusMock };
    onError(err, {}, res);
    expect(statusMock).to.have.been.calledWith(500);
    expect(jsonMock).to.have.been.calledWith({
      error: 'Error communicating with payroll service',
      details: 'proxy error'
    });
  });

  // Error handler branch coverage for all routes
  it('Error handler for /salaries/list', async () => {
    forwardRequestStub.throws(new Error('fail'));
    const res = await request(app).get('/v1/salaries/list');
    expect(res.status).to.equal(500);
    expect(res.body.error).to.match(/Error communicating with payroll service/);
    expect(res.body.details).to.equal('fail');
  });

  it('Error handler for /attendances/list', async () => {
    forwardRequestStub.throws(new Error('fail'));
    const res = await request(app).get('/v1/attendances/list');
    expect(res.status).to.equal(500);
    expect(res.body.error).to.match(/Error communicating with payroll service/);
    expect(res.body.details).to.equal('fail');
  });

  it('Error handler for /attendance-deductions/list', async () => {
    forwardRequestStub.throws(new Error('fail'));
    const res = await request(app).get('/v1/attendance-deductions/list');
    expect(res.status).to.equal(500);
    expect(res.body.error).to.match(/Error communicating with payroll service/);
    expect(res.body.details).to.equal('fail');
  });

  it('Error handler for /payslips/list', async () => {
    forwardRequestStub.throws(new Error('fail'));
    const res = await request(app).get('/v1/payslips/list');
    expect(res.status).to.equal(500);
    expect(res.body.error).to.match(/Error communicating with payroll service/);
    expect(res.body.details).to.equal('fail');
  });

  it('Proxy fallback for /payroll', async () => {
    const res = await request(app).get('/v1/payroll/anything');
    expect(res.status).to.equal(200);
    expect(res.body).to.deep.equal({ proxied: true });
  });

  it('Proxy fallback for /attendances', async () => {
    const res = await request(app).get('/v1/attendances/anything');
    expect(res.status).to.equal(200);
    expect(res.body).to.deep.equal({ proxied: true });
  });

  it('Proxy fallback for /attendance-deductions', async () => {
    const res = await request(app).get('/v1/attendance-deductions/anything');
    expect(res.status).to.equal(200);
    expect(res.body).to.deep.equal({ proxied: true });
  });

  it('Proxy fallback for /payslips', async () => {
    const res = await request(app).get('/v1/payslips/anything');
    expect(res.status).to.equal(200);
    expect(res.body).to.deep.equal({ proxied: true });
  });

  // Proxy onError branch
  it('Proxy middleware onError handles error', () => {
    const proxyConfig = createProxyMiddlewareStub.getCall(0).args[0];
    const onErrorHandler = proxyConfig.onError;
    const mockRes = { status: sinon.stub().returnsThis(), json: sinon.stub() };
    const mockError = new Error('Proxy failed');
    onErrorHandler(mockError, {}, mockRes);
    expect(mockRes.status).to.have.been.calledWith(500);
    expect(mockRes.json).to.have.been.calledWith({
      error: 'Error communicating with payroll service',
      details: 'Proxy failed'
    });
  });

  // handleServiceError fallback branch (error tanpa .message)
  it('handleServiceError fallback to "Service unavailable"', () => {
    const res = { headersSent: false, status: sinon.stub().returnsThis(), json: sinon.stub() };
    const error = Object.create(null); // error tanpa .message
    handleServiceError(error, res, 'payroll');
    expect(res.status).to.have.been.calledWith(500);
    expect(res.json).to.have.been.calledWith({
      error: 'Error communicating with payroll service',
      details: undefined // fallback ke undefined jika error.message tidak ada
    });
  });

  // handleServiceError branch headersSent = true
  it('handleServiceError does not send response if headersSent', () => {
    const res = { headersSent: true, status: sinon.stub(), json: sinon.stub() };
    const error = new Error('fail');
    handleServiceError(error, res, 'payroll');
    expect(res.status).to.not.have.been.called;
    expect(res.json).to.not.have.been.called;
  });
});