const express = require('express');
const request = require('supertest');

// Mock dependencies
jest.mock('http-proxy-middleware', () => ({
  createProxyMiddleware: jest.fn(() => (req, res, next) => {
    // Simulasi proxy fallback: tandai response
    if (res && typeof res.json === 'function') res.json({ proxied: true });
    else if (typeof next === 'function') next();
  })
}));
const { forwardRequestWithFailover } = require('../../../utils/requestHandler');
jest.mock('../../../utils/requestHandler', () => ({
  forwardRequestWithFailover: jest.fn()
}));

const createEmployeeRouter = require('../../../routes/employee');

// Export handleServiceError untuk branch coverage
const employeeModule = require('../../../routes/employee');
const handleServiceError = employeeModule.handleServiceError || (() => {});

describe('Employee Router', () => {
  let app;
  const EMPLOYEE_SERVICE_URL = 'http://mock-employee-service';

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use('/v1', createEmployeeRouter(EMPLOYEE_SERVICE_URL));
  });

  // --- Employee routes ---
  test('POST /employees/add calls forwardRequestWithFailover', async () => {
    forwardRequestWithFailover.mockImplementationOnce((...args) => args[3].status(201).json({ ok: true }));
    const res = await request(app).post('/v1/employees/add').send({ name: 'test' });
    expect(res.status).toBe(201);
    expect(forwardRequestWithFailover).toHaveBeenCalledWith(EMPLOYEE_SERVICE_URL, '/v1/employees/add', expect.any(Object), expect.any(Object));
  });

  test('PUT /employees/edit/:id calls forwardRequestWithFailover', async () => {
    forwardRequestWithFailover.mockImplementationOnce((...args) => args[3].json({ updated: true }));
    const res = await request(app).put('/v1/employees/edit/1').send({ name: 'edit' });
    expect(res.body).toEqual({ updated: true });
    expect(forwardRequestWithFailover).toHaveBeenCalledWith(EMPLOYEE_SERVICE_URL, '/v1/employees/edit/1', expect.any(Object), expect.any(Object));
  });

  test('DELETE /employees/delete/:id calls forwardRequestWithFailover', async () => {
    forwardRequestWithFailover.mockImplementationOnce((...args) => args[3].json({ deleted: true }));
    const res = await request(app).delete('/v1/employees/delete/1');
    expect(res.body).toEqual({ deleted: true });
    expect(forwardRequestWithFailover).toHaveBeenCalledWith(EMPLOYEE_SERVICE_URL, '/v1/employees/delete/1', expect.any(Object), expect.any(Object));
  });

  test('GET /employees/detail/:id calls forwardRequestWithFailover', async () => {
    forwardRequestWithFailover.mockImplementationOnce((...args) => args[3].json({ id: 1 }));
    const res = await request(app).get('/v1/employees/detail/1');
    expect(res.body).toEqual({ id: 1 });
    expect(forwardRequestWithFailover).toHaveBeenCalledWith(EMPLOYEE_SERVICE_URL, '/v1/employees/detail/1', expect.any(Object), expect.any(Object));
  });

  test('GET /employees/list calls forwardRequestWithFailover', async () => {
    forwardRequestWithFailover.mockImplementationOnce((...args) => args[3].json([{ id: 1 }]));
    const res = await request(app).get('/v1/employees/list');
    expect(res.body).toEqual([{ id: 1 }]);
    expect(forwardRequestWithFailover).toHaveBeenCalledWith(EMPLOYEE_SERVICE_URL, '/v1/employees/list', expect.any(Object), expect.any(Object));
  });

  test('GET /employees/options calls forwardRequestWithFailover', async () => {
    forwardRequestWithFailover.mockImplementationOnce((...args) => args[3].json([{ id: 1 }]));
    const res = await request(app).get('/v1/employees/options');
    expect(res.body).toEqual([{ id: 1 }]);
    expect(forwardRequestWithFailover).toHaveBeenCalledWith(EMPLOYEE_SERVICE_URL, '/v1/employees/options', expect.any(Object), expect.any(Object));
  });

  test('PATCH /employees/patch/:id calls forwardRequestWithFailover', async () => {
    forwardRequestWithFailover.mockImplementationOnce((...args) => args[3].json({ patched: true }));
    const res = await request(app).patch('/v1/employees/patch/1').send({ status: 'active' });
    expect(res.body).toEqual({ patched: true });
    expect(forwardRequestWithFailover).toHaveBeenCalledWith(EMPLOYEE_SERVICE_URL, '/v1/employees/patch/1', expect.any(Object), expect.any(Object));
  });

  test('POST /employees/upload calls forwardRequestWithFailover', async () => {
    forwardRequestWithFailover.mockImplementationOnce((...args) => args[3].json({ uploaded: true }));
    const res = await request(app)
      .post('/v1/employees/upload')
      .attach('file', Buffer.from('test'), 'test.txt');
    expect(res.body).toEqual({ uploaded: true });
    expect(forwardRequestWithFailover).toHaveBeenCalledWith(EMPLOYEE_SERVICE_URL, '/v1/employees/upload', expect.any(Object), expect.any(Object));
  });

  test('GET /employees/download calls forwardRequestWithFailover', async () => {
    forwardRequestWithFailover.mockImplementationOnce((...args) => args[3].json({ downloaded: true }));
    const res = await request(app).get('/v1/employees/download');
    expect(res.body).toEqual({ downloaded: true });
    expect(forwardRequestWithFailover).toHaveBeenCalledWith(
      EMPLOYEE_SERVICE_URL,
      '/v1/employees/download',
      expect.any(Object),
      expect.any(Object),
      { responseType: 'stream' }
    );
  });

  // --- Organization routes ---
  test('POST /departments/add calls forwardRequestWithFailover', async () => {
    forwardRequestWithFailover.mockImplementationOnce((...args) => args[3].json({ ok: true }));
    const res = await request(app).post('/v1/departments/add').send({ name: 'test' });
    expect(res.body).toEqual({ ok: true });
    expect(forwardRequestWithFailover).toHaveBeenCalledWith(EMPLOYEE_SERVICE_URL, '/v1/departments/add', expect.any(Object), expect.any(Object));
  });

  test('PUT /departments/edit/:id calls forwardRequestWithFailover', async () => {
    forwardRequestWithFailover.mockImplementationOnce((...args) => args[3].json({ updated: true }));
    const res = await request(app).put('/v1/departments/edit/1').send({ name: 'edit' });
    expect(res.body).toEqual({ updated: true });
    expect(forwardRequestWithFailover).toHaveBeenCalledWith(EMPLOYEE_SERVICE_URL, '/v1/departments/edit/1', expect.any(Object), expect.any(Object));
  });

  test('GET /departments/list calls forwardRequestWithFailover', async () => {
    forwardRequestWithFailover.mockImplementationOnce((...args) => args[3].json([{ id: 1 }]));
    const res = await request(app).get('/v1/departments/list');
    expect(res.body).toEqual([{ id: 1 }]);
    expect(forwardRequestWithFailover).toHaveBeenCalledWith(EMPLOYEE_SERVICE_URL, '/v1/departments/list', expect.any(Object), expect.any(Object));
  });

  test('POST /positions/add calls forwardRequestWithFailover', async () => {
    forwardRequestWithFailover.mockImplementationOnce((...args) => args[3].json({ ok: true }));
    const res = await request(app).post('/v1/positions/add').send({ name: 'test' });
    expect(res.body).toEqual({ ok: true });
    expect(forwardRequestWithFailover).toHaveBeenCalledWith(EMPLOYEE_SERVICE_URL, '/v1/positions/add', expect.any(Object), expect.any(Object));
  });

  test('PUT /positions/edit/:id calls forwardRequestWithFailover', async () => {
    forwardRequestWithFailover.mockImplementationOnce((...args) => args[3].json({ updated: true }));
    const res = await request(app).put('/v1/positions/edit/1').send({ name: 'edit' });
    expect(res.body).toEqual({ updated: true });
    expect(forwardRequestWithFailover).toHaveBeenCalledWith(EMPLOYEE_SERVICE_URL, '/v1/positions/edit/1', expect.any(Object), expect.any(Object));
  });

  test('GET /positions/list calls forwardRequestWithFailover', async () => {
    forwardRequestWithFailover.mockImplementationOnce((...args) => args[3].json([{ id: 1 }]));
    const res = await request(app).get('/v1/positions/list');
    expect(res.body).toEqual([{ id: 1 }]);
    expect(forwardRequestWithFailover).toHaveBeenCalledWith(EMPLOYEE_SERVICE_URL, '/v1/positions/list', expect.any(Object), expect.any(Object));
  });

  test('POST /contract-types/add calls forwardRequestWithFailover', async () => {
    forwardRequestWithFailover.mockImplementationOnce((...args) => args[3].json({ ok: true }));
    const res = await request(app).post('/v1/contract-types/add').send({ name: 'test' });
    expect(res.body).toEqual({ ok: true });
    expect(forwardRequestWithFailover).toHaveBeenCalledWith(EMPLOYEE_SERVICE_URL, '/v1/contract-types/add', expect.any(Object), expect.any(Object));
  });

  test('PUT /contract-types/edit/:id calls forwardRequestWithFailover', async () => {
    forwardRequestWithFailover.mockImplementationOnce((...args) => args[3].json({ updated: true }));
    const res = await request(app).put('/v1/contract-types/edit/1').send({ name: 'edit' });
    expect(res.body).toEqual({ updated: true });
    expect(forwardRequestWithFailover).toHaveBeenCalledWith(EMPLOYEE_SERVICE_URL, '/v1/contract-types/edit/1', expect.any(Object), expect.any(Object));
  });

  test('GET /contract-types/list calls forwardRequestWithFailover', async () => {
    forwardRequestWithFailover.mockImplementationOnce((...args) => args[3].json([{ id: 1 }]));
    const res = await request(app).get('/v1/contract-types/list');
    expect(res.body).toEqual([{ id: 1 }]);
    expect(forwardRequestWithFailover).toHaveBeenCalledWith(EMPLOYEE_SERVICE_URL, '/v1/contract-types/list', expect.any(Object), expect.any(Object));
  });

  test('GET /marital-status/list calls forwardRequestWithFailover', async () => {
    forwardRequestWithFailover.mockImplementationOnce((...args) => args[3].json([{ id: 1 }]));
    const res = await request(app).get('/v1/marital-status/list');
    expect(res.body).toEqual([{ id: 1 }]);
    expect(forwardRequestWithFailover).toHaveBeenCalledWith(EMPLOYEE_SERVICE_URL, '/v1/marital-status/list', expect.any(Object), expect.any(Object));
  });

  // --- Proxy fallback routes ---
  test('Proxy fallback for /statuses', async () => {
    const res = await request(app).get('/v1/statuses/anything');
    expect(res.body).toHaveProperty('proxied', true);
  });
  test('Proxy fallback for /image', async () => {
    const res = await request(app).get('/v1/image/anything');
    expect(res.body).toHaveProperty('proxied', true);
  });
  test('Proxy fallback for /dashboards', async () => {
    const res = await request(app).get('/v1/dashboards/anything');
    expect(res.body).toHaveProperty('proxied', true);
  });

  // --- Error handler branch coverage ---
  test('Error handler for /employees/list', async () => {
    forwardRequestWithFailover.mockImplementationOnce(() => { throw new Error('fail'); });
    const res = await request(app).get('/v1/employees/list');
    expect(res.status).toBe(500);
    expect(res.body.error).toMatch(/Error communicating with employee service/);
    expect(res.body.details).toBe('fail');
  });

  test('Error handler for /departments/list', async () => {
    forwardRequestWithFailover.mockImplementationOnce(() => { throw new Error('fail'); });
    const res = await request(app).get('/v1/departments/list');
    expect(res.status).toBe(500);
    expect(res.body.error).toMatch(/Error communicating with employee service/);
    expect(res.body.details).toBe('fail');
  });

  test('Error handler for /positions/list', async () => {
    forwardRequestWithFailover.mockImplementationOnce(() => { throw new Error('fail'); });
    const res = await request(app).get('/v1/positions/list');
    expect(res.status).toBe(500);
    expect(res.body.error).toMatch(/Error communicating with employee service/);
    expect(res.body.details).toBe('fail');
  });

  test('Error handler for /contract-types/list', async () => {
    forwardRequestWithFailover.mockImplementationOnce(() => { throw new Error('fail'); });
    const res = await request(app).get('/v1/contract-types/list');
    expect(res.status).toBe(500);
    expect(res.body.error).toMatch(/Error communicating with employee service/);
    expect(res.body.details).toBe('fail');
  });

  test('Error handler for /marital-status/list', async () => {
    forwardRequestWithFailover.mockImplementationOnce(() => { throw new Error('fail'); });
    const res = await request(app).get('/v1/marital-status/list');
    expect(res.status).toBe(500);
    expect(res.body.error).toMatch(/Error communicating with employee service/);
    expect(res.body.details).toBe('fail');
  });

  // --- handleServiceError branch for headersSent = true ---
  test('handleServiceError does not send response if headersSent', () => {
    const res = { headersSent: true, status: jest.fn(), json: jest.fn() };
    const error = new Error('fail');
    // Export handleServiceError dari employee.js jika belum
    if (handleServiceError) handleServiceError(error, res, 'employee');
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  // --- Proxy onError handler ---
  test('Proxy middleware onError handles error', () => {
    const { createProxyMiddleware } = require('http-proxy-middleware');
    const proxyConfig = createProxyMiddleware.mock.calls[0][0];
    const onErrorHandler = proxyConfig.onError;
    const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const mockError = new Error('Proxy failed');
    onErrorHandler(mockError, {}, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Error communicating with employee service',
      details: 'Proxy failed'
    });
  });

    test('handleServiceError fallback to "Service unavailable"', () => {
    const res = { headersSent: false, status: jest.fn().mockReturnThis(), json: jest.fn() };
    const error = Object.create(null); // error tanpa .message dan .toString()
    handleServiceError(error, res, 'employee');
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Error communicating with employee service',
      details: 'Service unavailable'
    });
  });
});