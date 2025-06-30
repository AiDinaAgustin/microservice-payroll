const express = require('express');
const request = require('supertest');

// Mock dependencies
jest.mock('http-proxy-middleware', () => ({
  createProxyMiddleware: jest.fn(() => (req, res, next) => next())
}));
const { forwardRequest } = require('../../../utils/requestHandler');
jest.mock('../../../utils/requestHandler', () => ({
  forwardRequest: jest.fn()
}));

const createPayrollRouter = require('../../../routes/payroll');

describe('Payroll Router', () => {
  let app;
  const PAYROLL_SERVICE_URL = 'http://mock-payroll-service';

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use('/v1', createPayrollRouter(PAYROLL_SERVICE_URL));
  });

  // Salary routes
  test('POST /salaries/add calls forwardRequest', async () => {
    forwardRequest.mockImplementationOnce((...args) => args[3].status(201).json({ ok: true }));
    const res = await request(app).post('/v1/salaries/add').send({ name: 'test' });
    expect(res.status).toBe(201);
    expect(forwardRequest).toHaveBeenCalledWith(PAYROLL_SERVICE_URL, '/v1/salaries/add', expect.any(Object), expect.any(Object));
  });

  test('GET /salaries/list calls forwardRequest', async () => {
    forwardRequest.mockImplementationOnce((...args) => args[3].json([{ id: 1 }]));
    const res = await request(app).get('/v1/salaries/list');
    expect(res.body).toEqual([{ id: 1 }]);
    expect(forwardRequest).toHaveBeenCalledWith(PAYROLL_SERVICE_URL, '/v1/salaries/list', expect.any(Object), expect.any(Object));
  });

  test('GET /salaries/detail/:id calls forwardRequest', async () => {
    forwardRequest.mockImplementationOnce((...args) => args[3].json({ id: 1 }));
    const res = await request(app).get('/v1/salaries/detail/1');
    expect(res.body).toEqual({ id: 1 });
    expect(forwardRequest).toHaveBeenCalledWith(PAYROLL_SERVICE_URL, '/v1/salaries/detail/1', expect.any(Object), expect.any(Object));
  });

  test('PUT /salaries/edit/:id calls forwardRequest', async () => {
    forwardRequest.mockImplementationOnce((...args) => args[3].json({ updated: true }));
    const res = await request(app).put('/v1/salaries/edit/1').send({ name: 'edit' });
    expect(res.body).toEqual({ updated: true });
    expect(forwardRequest).toHaveBeenCalledWith(PAYROLL_SERVICE_URL, '/v1/salaries/edit/1', expect.any(Object), expect.any(Object));
  });

  test('DELETE /salaries/delete/:id calls forwardRequest', async () => {
    forwardRequest.mockImplementationOnce((...args) => args[3].json({ deleted: true }));
    const res = await request(app).delete('/v1/salaries/delete/1');
    expect(res.body).toEqual({ deleted: true });
    expect(forwardRequest).toHaveBeenCalledWith(PAYROLL_SERVICE_URL, '/v1/salaries/delete/1', expect.any(Object), expect.any(Object));
  });

  // Attendance routes
  test('POST /attendances/add calls forwardRequest', async () => {
    forwardRequest.mockImplementationOnce((...args) => args[3].json({ ok: true }));
    const res = await request(app).post('/v1/attendances/add').send({ name: 'test' });
    expect(res.body).toEqual({ ok: true });
    expect(forwardRequest).toHaveBeenCalledWith(PAYROLL_SERVICE_URL, '/v1/attendances/add', expect.any(Object), expect.any(Object));
  });

  test('GET /attendances/list calls forwardRequest', async () => {
    forwardRequest.mockImplementationOnce((...args) => args[3].json([{ id: 1 }]));
    const res = await request(app).get('/v1/attendances/list');
    expect(res.body).toEqual([{ id: 1 }]);
    expect(forwardRequest).toHaveBeenCalledWith(PAYROLL_SERVICE_URL, '/v1/attendances/list', expect.any(Object), expect.any(Object));
  });

  test('GET /attendances/detail/:id calls forwardRequest', async () => {
    forwardRequest.mockImplementationOnce((...args) => args[3].json({ id: 1 }));
    const res = await request(app).get('/v1/attendances/detail/1');
    expect(res.body).toEqual({ id: 1 });
    expect(forwardRequest).toHaveBeenCalledWith(PAYROLL_SERVICE_URL, '/v1/attendances/detail/1', expect.any(Object), expect.any(Object));
  });

  test('PUT /attendances/edit/:id calls forwardRequest', async () => {
    forwardRequest.mockImplementationOnce((...args) => args[3].json({ updated: true }));
    const res = await request(app).put('/v1/attendances/edit/1').send({ name: 'edit' });
    expect(res.body).toEqual({ updated: true });
    expect(forwardRequest).toHaveBeenCalledWith(PAYROLL_SERVICE_URL, '/v1/attendances/edit/1', expect.any(Object), expect.any(Object));
  });

  test('DELETE /attendances/delete/:id calls forwardRequest', async () => {
    forwardRequest.mockImplementationOnce((...args) => args[3].json({ deleted: true }));
    const res = await request(app).delete('/v1/attendances/delete/1');
    expect(res.body).toEqual({ deleted: true });
    expect(forwardRequest).toHaveBeenCalledWith(PAYROLL_SERVICE_URL, '/v1/attendances/delete/1', expect.any(Object), expect.any(Object));
  });

  // Attendance deduction routes
  test('POST /attendance-deductions/calculate calls forwardRequest', async () => {
    forwardRequest.mockImplementationOnce((...args) => args[3].json({ ok: true }));
    const res = await request(app).post('/v1/attendance-deductions/calculate').send({ name: 'test' });
    expect(res.body).toEqual({ ok: true });
    expect(forwardRequest).toHaveBeenCalledWith(PAYROLL_SERVICE_URL, '/v1/attendance-deductions/calculate', expect.any(Object), expect.any(Object));
  });

  test('POST /attendance-deductions/generate calls forwardRequest', async () => {
    forwardRequest.mockImplementationOnce((...args) => args[3].json({ ok: true }));
    const res = await request(app).post('/v1/attendance-deductions/generate').send({ name: 'test' });
    expect(res.body).toEqual({ ok: true });
    expect(forwardRequest).toHaveBeenCalledWith(PAYROLL_SERVICE_URL, '/v1/attendance-deductions/generate', expect.any(Object), expect.any(Object));
  });

  test('GET /attendance-deductions/list calls forwardRequest', async () => {
    forwardRequest.mockImplementationOnce((...args) => args[3].json([{ id: 1 }]));
    const res = await request(app).get('/v1/attendance-deductions/list');
    expect(res.body).toEqual([{ id: 1 }]);
    expect(forwardRequest).toHaveBeenCalledWith(PAYROLL_SERVICE_URL, '/v1/attendance-deductions/list', expect.any(Object), expect.any(Object));
  });

  test('GET /attendance-deductions/detail/:id calls forwardRequest', async () => {
    forwardRequest.mockImplementationOnce((...args) => args[3].json({ id: 1 }));
    const res = await request(app).get('/v1/attendance-deductions/detail/1');
    expect(res.body).toEqual({ id: 1 });
    expect(forwardRequest).toHaveBeenCalledWith(PAYROLL_SERVICE_URL, '/v1/attendance-deductions/detail/1', expect.any(Object), expect.any(Object));
  });

  test('DELETE /attendance-deductions/delete/:id calls forwardRequest', async () => {
    forwardRequest.mockImplementationOnce((...args) => args[3].json({ deleted: true }));
    const res = await request(app).delete('/v1/attendance-deductions/delete/1');
    expect(res.body).toEqual({ deleted: true });
    expect(forwardRequest).toHaveBeenCalledWith(PAYROLL_SERVICE_URL, '/v1/attendance-deductions/delete/1', expect.any(Object), expect.any(Object));
  });

  // Payslip routes
  test('POST /payslips/add calls forwardRequest', async () => {
    forwardRequest.mockImplementationOnce((...args) => args[3].json({ ok: true }));
    const res = await request(app).post('/v1/payslips/add').send({ name: 'test' });
    expect(res.body).toEqual({ ok: true });
    expect(forwardRequest).toHaveBeenCalledWith(PAYROLL_SERVICE_URL, '/v1/payslips/add', expect.any(Object), expect.any(Object));
  });

  test('POST /payslips/generate calls forwardRequest', async () => {
    forwardRequest.mockImplementationOnce((...args) => args[3].json({ ok: true }));
    const res = await request(app).post('/v1/payslips/generate').send({ name: 'test' });
    expect(res.body).toEqual({ ok: true });
    expect(forwardRequest).toHaveBeenCalledWith(PAYROLL_SERVICE_URL, '/v1/payslips/generate', expect.any(Object), expect.any(Object));
  });

  test('GET /payslips/list calls forwardRequest', async () => {
    forwardRequest.mockImplementationOnce((...args) => args[3].json([{ id: 1 }]));
    const res = await request(app).get('/v1/payslips/list');
    expect(res.body).toEqual([{ id: 1 }]);
    expect(forwardRequest).toHaveBeenCalledWith(PAYROLL_SERVICE_URL, '/v1/payslips/list', expect.any(Object), expect.any(Object));
  });

  test('GET /payslips/detail/:id calls forwardRequest', async () => {
    forwardRequest.mockImplementationOnce((...args) => args[3].json({ id: 1 }));
    const res = await request(app).get('/v1/payslips/detail/1');
    expect(res.body).toEqual({ id: 1 });
    expect(forwardRequest).toHaveBeenCalledWith(PAYROLL_SERVICE_URL, '/v1/payslips/detail/1', expect.any(Object), expect.any(Object));
  });

  // Error handling test
  test('Handles error in forwardRequest', async () => {
    forwardRequest.mockImplementationOnce(() => { throw new Error('fail'); });
    const res = await request(app).post('/v1/salaries/add').send({ name: 'test' });
    expect(res.status).toBe(500);
    expect(res.body.error).toMatch(/Error communicating with payroll service/);
  });
    // ...existing code...
  
    // Proxy fallback test (improve for coverage)
    test('Proxy fallback for /salaries', () => {
      const { createProxyMiddleware } = require('http-proxy-middleware');
      const onError = createProxyMiddleware.mock.calls[0][0].onError;
      const err = new Error('proxy error');
      const jsonMock = jest.fn();
      const statusMock = jest.fn(() => ({ json: jsonMock }));
      const res = { status: statusMock };
      onError(err, {}, res);
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Error communicating with payroll service',
        details: 'proxy error'
      });
    });
  
    // Error handler branch coverage for all routes
    test('Error handler for /salaries/list', async () => {
      forwardRequest.mockImplementationOnce(() => { throw new Error('fail'); });
      const res = await request(app).get('/v1/salaries/list');
      expect(res.status).toBe(500);
      expect(res.body.error).toMatch(/Error communicating with payroll service/);
      expect(res.body.details).toBe('fail');
    });
  
    test('Error handler for /attendances/list', async () => {
      forwardRequest.mockImplementationOnce(() => { throw new Error('fail'); });
      const res = await request(app).get('/v1/attendances/list');
      expect(res.status).toBe(500);
      expect(res.body.error).toMatch(/Error communicating with payroll service/);
      expect(res.body.details).toBe('fail');
    });
  
    test('Error handler for /attendance-deductions/list', async () => {
      forwardRequest.mockImplementationOnce(() => { throw new Error('fail'); });
      const res = await request(app).get('/v1/attendance-deductions/list');
      expect(res.status).toBe(500);
      expect(res.body.error).toMatch(/Error communicating with payroll service/);
      expect(res.body.details).toBe('fail');
    });
  
    test('Error handler for /payslips/list', async () => {
      forwardRequest.mockImplementationOnce(() => { throw new Error('fail'); });
      const res = await request(app).get('/v1/payslips/list');
      expect(res.status).toBe(500);
      expect(res.body.error).toMatch(/Error communicating with payroll service/);
      expect(res.body.details).toBe('fail');
    });
});