const express = require('express');
const request = require('supertest');

// Mock dependencies
jest.mock('http-proxy-middleware', () => ({
  createProxyMiddleware: jest.fn(() => (req, res, next) => {
    res.status(200).json({ proxied: true });
  })
}));

// ➕ Update mock - ganti forwardRequest dengan forwardRequestWithFailover
jest.mock('../../../utils/requestHandler', () => ({
  forwardRequestWithFailover: jest.fn((serviceUrl, path, req, res, options = {}) => {
    // Mock successful responses based on path
    if (path.includes('/v1/employees/list')) {
      res.status(200).json({ 
        data: [{ id: '1', name: 'Test Employee' }],
        pagination: { total: 1 }
      });
    } else if (path.includes('/v1/employees/detail/')) {
      const id = path.split('/').pop();
      res.status(200).json({ id, name: 'Test Employee', email: 'test@example.com' });
    } else if (path.includes('/v1/employees/add')) {
      res.status(201).json({ id: '1', ...req.body, created: true });
    } else if (path.includes('/v1/employees/edit/')) {
      res.status(200).json({ ...req.body, updated: true });
    } else if (path.includes('/v1/employees/delete/')) {
      res.status(200).json({ deleted: true });
    } else if (path.includes('/v1/employees/upload')) {
      res.status(200).json({ 
        uploaded: true, 
        filename: req.file?.originalname || 'test.csv'
      });
    } else if (path.includes('/v1/employees/download')) {
      if (options.responseType === 'stream') {
        res.status(200);
        res.end('mock file content');
      } else {
        res.status(200).json({ file: 'downloaded' });
      }
    } else if (path.includes('/v1/employees/options')) {
      res.status(200).json({ 
        options: [
          { id: '1', name: 'Employee 1' },
          { id: '2', name: 'Employee 2' }
        ]
      });
    } else if (path.includes('/v1/employees/patch/')) {
      res.status(200).json({ ...req.body, patched: true });
    } else if (path.includes('/v1/departments/add')) {
      res.status(201).json({ id: '1', ...req.body, created: true });
    } else if (path.includes('/v1/departments/edit/')) {
      res.status(200).json({ ...req.body, updated: true });
    } else if (path.includes('/v1/departments/list')) {
      res.status(200).json({ 
        data: [{ id: '1', name: 'Test Department' }]
      });
    } else if (path.includes('/v1/positions/add')) {
      res.status(201).json({ id: '1', ...req.body, created: true });
    } else if (path.includes('/v1/positions/edit/')) {
      res.status(200).json({ ...req.body, updated: true });
    } else if (path.includes('/v1/positions/list')) {
      res.status(200).json({ 
        data: [{ id: '1', name: 'Test Position' }]
      });
    } else if (path.includes('/v1/contract-types/add')) {
      res.status(201).json({ id: '1', ...req.body, created: true });
    } else if (path.includes('/v1/contract-types/edit/')) {
      res.status(200).json({ ...req.body, updated: true });
    } else if (path.includes('/v1/contract-types/list')) {
      res.status(200).json({ 
        data: [{ id: '1', name: 'Test Contract Type' }]
      });
    } else if (path.includes('/v1/marital-status/list')) {
      res.status(200).json({ 
        data: [{ id: '1', name: 'Single' }]
      });
    } else {
      res.status(404).json({ error: 'Not found' });
    }
  }),
  // ➕ Keep original forwardRequest for backward compatibility
  forwardRequest: jest.fn()
}));

// ➕ Fix multer mock
jest.mock('multer', () => {
  const mockMulter = jest.fn(() => ({
    single: jest.fn(() => (req, res, next) => {
      req.file = {
        buffer: Buffer.from('test file content'),
        originalname: 'test.csv',
        mimetype: 'text/csv'
      };
      next();
    })
  }));
  
  mockMulter.memoryStorage = jest.fn(() => ({}));
  return mockMulter;
});

// Import mocks
const { createProxyMiddleware } = require('http-proxy-middleware');
const { forwardRequestWithFailover } = require('../../../utils/requestHandler');

// Import module under test
const createEmployeeRouter = require('../../../routes/employee');

describe('Employee Routes', () => {
  let app;
  const EMPLOYEE_SERVICE_URL = 'http://mock-employee-service';

  beforeEach(() => {
    jest.clearAllMocks();
    
    app = express();
    app.use(express.json());
    
    const employeeRouter = createEmployeeRouter(EMPLOYEE_SERVICE_URL);
    app.use('/v1', employeeRouter);
  });

  // ➕ Test proxy initialization
  test('Harus menginisialisasi proxy middleware dengan opsi yang benar', () => {
    expect(createProxyMiddleware).toHaveBeenCalledWith({
      target: EMPLOYEE_SERVICE_URL,
      changeOrigin: true,
      pathRewrite: null,
      logLevel: 'debug',
      onError: expect.any(Function)
    });
  });

  // ➕ Employee Management Tests
  test('GET /employees/list harus memanggil forwardRequestWithFailover dengan argumen yang benar', async () => {
    const response = await request(app)
      .get('/v1/employees/list')
      .query({ page: 1, limit: 10 });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('data');
    expect(forwardRequestWithFailover).toHaveBeenCalledWith(
      EMPLOYEE_SERVICE_URL,
      '/v1/employees/list',
      expect.anything(),
      expect.anything()
    );
  });

  test('POST /employees/add harus memanggil forwardRequestWithFailover dengan argumen yang benar', async () => {
    const employeeData = { 
      name: 'New Employee', 
      email: 'new@example.com'
    };
    
    const response = await request(app)
      .post('/v1/employees/add')
      .send(employeeData);
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('created', true);
    expect(forwardRequestWithFailover).toHaveBeenCalledWith(
      EMPLOYEE_SERVICE_URL,
      '/v1/employees/add',
      expect.anything(),
      expect.anything()
    );
  });

  test('PUT /employees/edit/:id harus memanggil forwardRequestWithFailover dengan argumen yang benar', async () => {
    const employeeData = { 
      name: 'Updated Employee', 
      email: 'updated@example.com'
    };
    
    const response = await request(app)
      .put('/v1/employees/edit/1')
      .send(employeeData);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('updated', true);
    expect(forwardRequestWithFailover).toHaveBeenCalledWith(
      EMPLOYEE_SERVICE_URL,
      '/v1/employees/edit/1',
      expect.anything(),
      expect.anything()
    );
  });

  test('DELETE /employees/delete/:id harus memanggil forwardRequestWithFailover dengan argumen yang benar', async () => {
    const response = await request(app)
      .delete('/v1/employees/delete/1');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('deleted', true);
    expect(forwardRequestWithFailover).toHaveBeenCalledWith(
      EMPLOYEE_SERVICE_URL,
      '/v1/employees/delete/1',
      expect.anything(),
      expect.anything()
    );
  });

  test('GET /employees/detail/:id harus memanggil forwardRequestWithFailover dengan argumen yang benar', async () => {
    const response = await request(app)
      .get('/v1/employees/detail/1');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', '1');
    expect(forwardRequestWithFailover).toHaveBeenCalledWith(
      EMPLOYEE_SERVICE_URL,
      '/v1/employees/detail/1',
      expect.anything(),
      expect.anything()
    );
  });

  test('GET /employees/options harus memanggil forwardRequestWithFailover dengan argumen yang benar', async () => {
    const response = await request(app)
      .get('/v1/employees/options');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('options');
    expect(forwardRequestWithFailover).toHaveBeenCalledWith(
      EMPLOYEE_SERVICE_URL,
      '/v1/employees/options',
      expect.anything(),
      expect.anything()
    );
  });

  test('PATCH /employees/patch/:id harus memanggil forwardRequestWithFailover dengan argumen yang benar', async () => {
    const patchData = { status: 'active' };
    
    const response = await request(app)
      .patch('/v1/employees/patch/1')
      .send(patchData);
    
    expect(response.status).toBe(200);
    expect(forwardRequestWithFailover).toHaveBeenCalledWith(
      EMPLOYEE_SERVICE_URL,
      '/v1/employees/patch/1',
      expect.anything(),
      expect.anything()
    );
  });

  // ➕ File Operations Tests
  test('POST /employees/upload harus menangani unggahan file dengan benar', async () => {
    const response = await request(app)
      .post('/v1/employees/upload')
      .attach('file', Buffer.from('test file content'), 'test.csv');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('uploaded', true);
    expect(response.body).toHaveProperty('filename', 'test.csv');
    expect(forwardRequestWithFailover).toHaveBeenCalledWith(
      EMPLOYEE_SERVICE_URL,
      '/v1/employees/upload',
      expect.anything(),
      expect.anything()
    );
  });

  test('GET /employees/download harus menangani unduhan file dengan benar', async () => {
    const response = await request(app)
      .get('/v1/employees/download')
      .query({ type: 'csv' });
    
    expect(response.status).toBe(200);
    expect(forwardRequestWithFailover).toHaveBeenCalledWith(
      EMPLOYEE_SERVICE_URL,
      '/v1/employees/download',
      expect.anything(),
      expect.anything(),
      { responseType: 'stream' }
    );
  });

  // ➕ Department Management Tests
  test('POST /departments/add harus memanggil forwardRequestWithFailover dengan argumen yang benar', async () => {
    const departmentData = { name: 'New Department' };
    
    const response = await request(app)
      .post('/v1/departments/add')
      .send(departmentData);
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('created', true);
    expect(forwardRequestWithFailover).toHaveBeenCalledWith(
      EMPLOYEE_SERVICE_URL,
      '/v1/departments/add',
      expect.anything(),
      expect.anything()
    );
  });

  test('PUT /departments/edit/:id harus memanggil forwardRequestWithFailover dengan argumen yang benar', async () => {
    const departmentData = { name: 'Updated Department' };
    
    const response = await request(app)
      .put('/v1/departments/edit/1')
      .send(departmentData);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('updated', true);
    expect(forwardRequestWithFailover).toHaveBeenCalledWith(
      EMPLOYEE_SERVICE_URL,
      '/v1/departments/edit/1',
      expect.anything(),
      expect.anything()
    );
  });

  test('GET /departments/list harus memanggil forwardRequestWithFailover dengan argumen yang benar', async () => {
    const response = await request(app)
      .get('/v1/departments/list');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('data');
    expect(forwardRequestWithFailover).toHaveBeenCalledWith(
      EMPLOYEE_SERVICE_URL,
      '/v1/departments/list',
      expect.anything(),
      expect.anything()
    );
  });

  // ➕ Position Management Tests
  test('POST /positions/add harus memanggil forwardRequestWithFailover dengan argumen yang benar', async () => {
    const positionData = { name: 'New Position' };
    
    const response = await request(app)
      .post('/v1/positions/add')
      .send(positionData);
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('created', true);
    expect(forwardRequestWithFailover).toHaveBeenCalledWith(
      EMPLOYEE_SERVICE_URL,
      '/v1/positions/add',
      expect.anything(),
      expect.anything()
    );
  });

  test('PUT /positions/edit/:id harus memanggil forwardRequestWithFailover dengan argumen yang benar', async () => {
    const positionData = { name: 'Updated Position' };
    
    const response = await request(app)
      .put('/v1/positions/edit/1')
      .send(positionData);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('updated', true);
    expect(forwardRequestWithFailover).toHaveBeenCalledWith(
      EMPLOYEE_SERVICE_URL,
      '/v1/positions/edit/1',
      expect.anything(),
      expect.anything()
    );
  });

  test('GET /positions/list harus memanggil forwardRequestWithFailover dengan argumen yang benar', async () => {
    const response = await request(app)
      .get('/v1/positions/list');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('data');
    expect(forwardRequestWithFailover).toHaveBeenCalledWith(
      EMPLOYEE_SERVICE_URL,
      '/v1/positions/list',
      expect.anything(),
      expect.anything()
    );
  });

  // ➕ Contract Type Management Tests
  test('POST /contract-types/add harus memanggil forwardRequestWithFailover dengan argumen yang benar', async () => {
    const contractTypeData = { name: 'New Contract Type' };
    
    const response = await request(app)
      .post('/v1/contract-types/add')
      .send(contractTypeData);
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('created', true);
    expect(forwardRequestWithFailover).toHaveBeenCalledWith(
      EMPLOYEE_SERVICE_URL,
      '/v1/contract-types/add',
      expect.anything(),
      expect.anything()
    );
  });

  test('PUT /contract-types/edit/:id harus memanggil forwardRequestWithFailover dengan argumen yang benar', async () => {
    const contractTypeData = { name: 'Updated Contract Type' };
    
    const response = await request(app)
      .put('/v1/contract-types/edit/1')
      .send(contractTypeData);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('updated', true);
    expect(forwardRequestWithFailover).toHaveBeenCalledWith(
      EMPLOYEE_SERVICE_URL,
      '/v1/contract-types/edit/1',
      expect.anything(),
      expect.anything()
    );
  });

  test('GET /contract-types/list harus memanggil forwardRequestWithFailover dengan argumen yang benar', async () => {
    const response = await request(app)
      .get('/v1/contract-types/list');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('data');
    expect(forwardRequestWithFailover).toHaveBeenCalledWith(
      EMPLOYEE_SERVICE_URL,
      '/v1/contract-types/list',
      expect.anything(),
      expect.anything()
    );
  });

  test('GET /marital-status/list harus memanggil forwardRequestWithFailover dengan argumen yang benar', async () => {
    const response = await request(app)
      .get('/v1/marital-status/list');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('data');
    expect(forwardRequestWithFailover).toHaveBeenCalledWith(
      EMPLOYEE_SERVICE_URL,
      '/v1/marital-status/list',
      expect.anything(),
      expect.anything()
    );
  });

  // ➕ Proxy Tests
  test('Rute proxy harus menggunakan proxy middleware', async () => {
    // Test routes that should use proxy middleware
    const routesToTest = [
      '/v1/statuses/list',
      '/v1/image/1',
      '/v1/dashboards/stats'
    ];

    for (const route of routesToTest) {
      const response = await request(app).get(route);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('proxied', true);
    }
  });

  // ➕ Error Handling Tests
  test('Harus menangani error dari employee service', async () => {
    forwardRequestWithFailover.mockImplementationOnce((serviceUrl, path, req, res) => {
      res.status(500).json({ 
        error: 'Service error', 
        message: 'Database connection failed' 
      });
    });
    
    const response = await request(app)
      .get('/v1/employees/list');
    
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Service error');
  });

  test('Harus menangani error validasi dengan benar', async () => {
    forwardRequestWithFailover.mockImplementationOnce((serviceUrl, path, req, res) => {
      res.status(400).json({ 
        error: 'Validation error', 
        fields: ['name', 'email'],
        message: 'Name and email are required' 
      });
    });
    
    const response = await request(app)
      .post('/v1/employees/add')
      .send({});
    
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Validation error');
    expect(response.body).toHaveProperty('fields');
  });

  // ➕ Console Log Coverage Tests
  test('Harus mencatat log untuk semua operasi employee', async () => {
    const consoleSpy = jest.spyOn(console, 'log');
    
    await request(app).post('/v1/employees/add').send({ name: 'Test' });
    await request(app).put('/v1/employees/edit/1').send({ name: 'Test' });
    await request(app).delete('/v1/employees/delete/1');
    await request(app).get('/v1/employees/detail/1');
    await request(app).get('/v1/employees/list');
    await request(app).get('/v1/employees/options');
    await request(app).patch('/v1/employees/patch/1').send({ status: 'active' });
    await request(app).post('/v1/employees/upload').attach('file', Buffer.from('test'), 'test.csv');
    await request(app).get('/v1/employees/download');
    
    expect(consoleSpy).toHaveBeenCalledWith('🔄 Add employee request received, using failover routing');
    expect(consoleSpy).toHaveBeenCalledWith('🔄 Edit employee request received, using failover routing');
    expect(consoleSpy).toHaveBeenCalledWith('🔄 Delete employee request received, using failover routing');
    expect(consoleSpy).toHaveBeenCalledWith('🔄 Employee detail request received, using failover routing');
    expect(consoleSpy).toHaveBeenCalledWith('🔄 Employee list request received, using failover routing');
    expect(consoleSpy).toHaveBeenCalledWith('🔄 Employee options request received, using failover routing');
    expect(consoleSpy).toHaveBeenCalledWith('🔄 Employee patch request received, using failover routing');
    expect(consoleSpy).toHaveBeenCalledWith('🔄 Employee upload request received, using failover routing');
    expect(consoleSpy).toHaveBeenCalledWith('🔄 Employee download request received, using failover routing');
    
    consoleSpy.mockRestore();
  });

  test('Harus mencatat log untuk semua operasi organization', async () => {
    const consoleSpy = jest.spyOn(console, 'log');
    
    await request(app).post('/v1/departments/add').send({ name: 'Test' });
    await request(app).put('/v1/departments/edit/1').send({ name: 'Test' });
    await request(app).get('/v1/departments/list');
    await request(app).post('/v1/positions/add').send({ name: 'Test' });
    await request(app).put('/v1/positions/edit/1').send({ name: 'Test' });
    await request(app).get('/v1/positions/list');
    await request(app).post('/v1/contract-types/add').send({ name: 'Test' });
    await request(app).put('/v1/contract-types/edit/1').send({ name: 'Test' });
    await request(app).get('/v1/contract-types/list');
    await request(app).get('/v1/marital-status/list');
    
    expect(consoleSpy).toHaveBeenCalledWith('🔄 Add department request received, using failover routing');
    expect(consoleSpy).toHaveBeenCalledWith('🔄 Edit department request received, using failover routing');
    expect(consoleSpy).toHaveBeenCalledWith('🔄 Department list request received, using failover routing');
    expect(consoleSpy).toHaveBeenCalledWith('🔄 Add position request received, using failover routing');
    expect(consoleSpy).toHaveBeenCalledWith('🔄 Edit position request received, using failover routing');
    expect(consoleSpy).toHaveBeenCalledWith('🔄 Position list request received, using failover routing');
    expect(consoleSpy).toHaveBeenCalledWith('🔄 Add contract type request received, using failover routing');
    expect(consoleSpy).toHaveBeenCalledWith('🔄 Edit contract type request received, using failover routing');
    expect(consoleSpy).toHaveBeenCalledWith('🔄 Contract type list request received, using failover routing');
    expect(consoleSpy).toHaveBeenCalledWith('🔄 Marital status list request received, using failover routing');
    
    consoleSpy.mockRestore();
  });

  // ➕ Proxy Error Handler Test
  test('Proxy middleware harus menangani error dengan benar', () => {
    const mockReq = {};
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const mockError = new Error('Connection refused');
    
    // Get the onError handler from the createProxyMiddleware call
    const proxyConfig = createProxyMiddleware.mock.calls[0][0];
    const onErrorHandler = proxyConfig.onError;
    
    // Call the error handler
    onErrorHandler(mockError, mockReq, mockRes);
    
    // Verify error handling
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Error communicating with employee service',
      details: 'Connection refused'
    });
  });
});