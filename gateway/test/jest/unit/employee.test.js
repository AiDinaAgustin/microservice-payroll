const express = require('express');
const request = require('supertest');
const multer = require('multer');

// Mock dependencies
jest.mock('http-proxy-middleware', () => ({
  createProxyMiddleware: jest.fn(() => (req, res, next) => {
    res.status(200).json({ proxied: true });
  })
}));

jest.mock('../../../utils/requestHandler', () => ({
  forwardRequest: jest.fn((serviceUrl, path, req, res) => {
    // Mock implementation of forwardRequest
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
        filename: req.file?.originalname || 'unknown'
      });
    } else if (path.includes('/v1/employees/download')) {
      // Mock the stream response
      res.status(200);
      res.end('mock file content');
    } else if (path.includes('/v1/departments/add')) {
      res.status(201).json({ id: '1', ...req.body, created: true });
    } else if (path.includes('/v1/departments/edit/')) {
      res.status(200).json({ ...req.body, updated: true });
    } else if (path.includes('/v1/positions/add')) {
      res.status(201).json({ id: '1', ...req.body, created: true });
    } else if (path.includes('/v1/positions/edit/')) {
      res.status(200).json({ ...req.body, updated: true });
    } else if (path.includes('/v1/contract-types/add')) {
      res.status(201).json({ id: '1', ...req.body, created: true });
    } else if (path.includes('/v1/contract-types/edit/')) {
      res.status(200).json({ ...req.body, updated: true });
    } else if (path.includes('/v1/employees/patch/')) {
      res.status(200).json({ ...req.body, patched: true });
    } else if (path.includes('/v1/employees/options')) {
      res.status(200).json({ 
        options: [
          { id: '1', name: 'Employee 1' },
          { id: '2', name: 'Employee 2' }
        ]
      });
    } else {
      res.status(404).json({ error: 'Not found' });
    }
  })
}));

// Better multer mock
jest.mock('multer', () => {
  return jest.fn().mockImplementation(() => {
    return {
      storage: {},
      single: jest.fn(() => {
        return (req, res, next) => {
          req.file = {
            buffer: Buffer.from('test file content'),
            originalname: 'test.csv',
            mimetype: 'text/csv'
          };
          next();
        };
      })
    };
  });
});

// Also update the multer.memoryStorage() mock
multer.memoryStorage = jest.fn(() => ({}));

// Import the mocks so we can access them in tests
const { createProxyMiddleware } = require('http-proxy-middleware');
const { forwardRequest } = require('../../../utils/requestHandler');

// Import the module under test
const createEmployeeRouter = require('../../../routes/employee');

describe('Employee Routes', () => {
  let app;
  const EMPLOYEE_SERVICE_URL = 'http://mock-employee-service';

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create a fresh Express app for each test
    app = express();
    app.use(express.json());
    
    // Mount the router
    const employeeRouter = createEmployeeRouter(EMPLOYEE_SERVICE_URL);
    app.use('/v1', employeeRouter);
  });

  test('Harus menginisialisasi proxy middleware dengan opsi yang benar', () => {
    expect(createProxyMiddleware).toHaveBeenCalledWith({
      target: EMPLOYEE_SERVICE_URL,
      changeOrigin: true,
      pathRewrite: null,
      logLevel: 'debug',
      onError: expect.any(Function)
    });
  });

  test('GET /employees/list harus memanggil forwardRequest dengan argumen yang benar', async () => {
    // Act
    const response = await request(app)
      .get('/v1/employees/list')
      .query({ page: 1, limit: 10 });
    
    // Assert
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('data');
    expect(forwardRequest).toHaveBeenCalledWith(
      EMPLOYEE_SERVICE_URL,
      '/v1/employees/list',
      expect.anything(),
      expect.anything()
    );
  });

  test('POST /employees/add harus memanggil forwardRequest dengan argumen yang benar', async () => {
    // Arrange
    const employeeData = { 
      name: 'New Employee', 
      email: 'new@example.com',
      position_id: '1',
      department_id: '2'
    };
    
    // Act
    const response = await request(app)
      .post('/v1/employees/add')
      .send(employeeData);
    
    // Assert
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('created', true);
    expect(forwardRequest).toHaveBeenCalledWith(
      EMPLOYEE_SERVICE_URL,
      '/v1/employees/add',
      expect.objectContaining({
        body: employeeData
      }),
      expect.anything()
    );
  });

  test('PUT /employees/edit/:id harus memanggil forwardRequest dengan argumen yang benar', async () => {
    // Arrange
    const employeeData = { 
      name: 'Updated Employee', 
      email: 'updated@example.com'
    };
    
    // Act
    const response = await request(app)
      .put('/v1/employees/edit/1')
      .send(employeeData);
    
    // Assert
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('updated', true);
    expect(forwardRequest).toHaveBeenCalledWith(
      EMPLOYEE_SERVICE_URL,
      '/v1/employees/edit/1',
      expect.objectContaining({
        body: employeeData
      }),
      expect.anything()
    );
  });

  test('DELETE /employees/delete/:id harus memanggil forwardRequest dengan argumen yang benar', async () => {
    // Act
    const response = await request(app)
      .delete('/v1/employees/delete/1');
    
    // Assert
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('deleted', true);
    expect(forwardRequest).toHaveBeenCalledWith(
      EMPLOYEE_SERVICE_URL,
      '/v1/employees/delete/1',
      expect.anything(),
      expect.anything()
    );
  });

  test('GET /employees/detail/:id harus memanggil forwardRequest dengan argumen yang benar', async () => {
    // Act
    const response = await request(app)
      .get('/v1/employees/detail/1');
    
    // Assert
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', '1');
    expect(forwardRequest).toHaveBeenCalledWith(
      EMPLOYEE_SERVICE_URL,
      '/v1/employees/detail/1',
      expect.anything(),
      expect.anything()
    );
  });

  test('POST /employees/upload harus menangani unggahan file dengan benar', async () => {
    // Act
    const response = await request(app)
      .post('/v1/employees/upload')
      .attach('file', Buffer.from('test file content'), 'test.csv');
    
    // Assert
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('uploaded', true);
    expect(response.body).toHaveProperty('filename', 'test.csv');
    expect(forwardRequest).toHaveBeenCalledWith(
      EMPLOYEE_SERVICE_URL,
      '/v1/employees/upload',
      expect.objectContaining({
        file: expect.objectContaining({
          originalname: 'test.csv'
        })
      }),
      expect.anything()
    );
  });

  test('GET /employees/download harus menangani unduhan file dengan benar', async () => {
    // Act
    const response = await request(app)
      .get('/v1/employees/download')
      .query({ type: 'csv' });
    
    // Assert
    expect(response.status).toBe(200);
    expect(forwardRequest).toHaveBeenCalledWith(
      EMPLOYEE_SERVICE_URL,
      '/v1/employees/download',
      expect.objectContaining({
        query: { type: 'csv' }
      }),
      expect.anything(),
      { responseType: 'stream' }
    );
  });

  test('POST /departments/add harus memanggil forwardRequest dengan argumen yang benar', async () => {
    // Arrange
    const departmentData = { name: 'New Department' };
    
    // Act
    const response = await request(app)
      .post('/v1/departments/add')
      .send(departmentData);
    
    // Assert
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('created', true);
    expect(forwardRequest).toHaveBeenCalledWith(
      EMPLOYEE_SERVICE_URL,
      '/v1/departments/add',
      expect.objectContaining({
        body: departmentData
      }),
      expect.anything()
    );
  });

  test('POST /positions/add harus memanggil forwardRequest dengan argumen yang benar', async () => {
    // Arrange
    const positionData = { name: 'New Position' };
    
    // Act
    const response = await request(app)
      .post('/v1/positions/add')
      .send(positionData);
    
    // Assert
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('created', true);
    expect(forwardRequest).toHaveBeenCalledWith(
      EMPLOYEE_SERVICE_URL,
      '/v1/positions/add',
      expect.objectContaining({
        body: positionData
      }),
      expect.anything()
    );
  });

  test('POST /contract-types/add harus memanggil forwardRequest dengan argumen yang benar', async () => {
    // Arrange
    const contractTypeData = { name: 'New Contract Type' };
    
    // Act
    const response = await request(app)
      .post('/v1/contract-types/add')
      .send(contractTypeData);
    
    // Assert
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('created', true);
    expect(forwardRequest).toHaveBeenCalledWith(
      EMPLOYEE_SERVICE_URL,
      '/v1/contract-types/add',
      expect.objectContaining({
        body: contractTypeData
      }),
      expect.anything()
    );
  });

  test('Rute proxy harus menggunakan proxy middleware', async () => {
    // Test various routes that should use proxy middleware
    const routesToTest = [
      '/v1/marital-status/list',
      '/v1/statuses/list',
      '/v1/image/1',
      '/v1/dashboards/stats'
    ];

    for (const route of routesToTest) {
      // Act
      const response = await request(app).get(route);
      
      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('proxied', true);
    }

    // Check that proxy middleware was used for these routes
    // and forwardRequest was not called
    expect(createProxyMiddleware).toHaveBeenCalled();
    expect(forwardRequest).not.toHaveBeenCalled();
  });
    
    test('Harus menangani error dari employee service', async () => {
      // Arrange
      forwardRequest.mockImplementationOnce((serviceUrl, path, req, res) => {
        res.status(500).json({ error: 'Service error', message: 'Database connection failed' });
      });
      
      // Act
      const response = await request(app)
        .get('/v1/employees/list');
      
      // Assert
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Service error');
    });
    
    // test('Proxy middleware harus menangani error dengan benar', async () => {
    //   // Arrange
    //   // Mock the proxy to trigger the onError handler
    //   createProxyMiddleware.mockImplementationOnce(() => {
    //     return (req, res, next) => {
    //       // Extract the onError handler from the proxy config
    //       const onErrorHandler = createProxyMiddleware.mock.calls[0][0].onError;
    //       // Call it with an error
    //       onErrorHandler(new Error('Connection refused'), req, res);
    //     };
    //   });
      
    //   // Create a new app with the error-throwing proxy
    //   const errorApp = express();
    //   errorApp.use(express.json());
    //   const employeeRouter = createEmployeeRouter(EMPLOYEE_SERVICE_URL);
    //   errorApp.use('/v1', employeeRouter);
      
    //   // Act
    //   const response = await request(errorApp)
    //     .get('/v1/marital-status/list');
      
    //   // Assert
    //   expect(response.status).toBe(500);
    //   expect(response.body).toHaveProperty('error', 'Error communicating with employee service');
    //   expect(response.body).toHaveProperty('details', 'Connection refused');
    // });
    
    test('Harus menangani error validasi dengan benar', async () => {
      // Arrange
      forwardRequest.mockImplementationOnce((serviceUrl, path, req, res) => {
        res.status(400).json({ 
          error: 'Validation error', 
          fields: ['name', 'email'],
          message: 'Name and email are required' 
        });
      });
      
      // Act
      const response = await request(app)
        .post('/v1/employees/add')
        .send({ /* empty data */ });
      
      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation error');
      expect(response.body).toHaveProperty('fields');
    });
    
    test('PUT /departments/edit/:id harus memanggil forwardRequest dengan argumen yang benar', async () => {
      // Arrange
      const departmentData = { 
        name: 'Updated Department', 
        description: 'Updated department description'
      };
      
      // Act
      const response = await request(app)
        .put('/v1/departments/edit/1')
        .send(departmentData);
      
      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('updated', true);
      expect(forwardRequest).toHaveBeenCalledWith(
        EMPLOYEE_SERVICE_URL,
        '/v1/departments/edit/1',
        expect.objectContaining({
          body: departmentData
        }),
        expect.anything()
      );
    });
    
    test('PUT /positions/edit/:id harus memanggil forwardRequest dengan argumen yang benar', async () => {
      // Arrange
      const positionData = { 
        name: 'Updated Position', 
        salary_range: '5000-7500'
      };
      
      // Act
      const response = await request(app)
        .put('/v1/positions/edit/1')
        .send(positionData);
      
      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('updated', true);
      expect(forwardRequest).toHaveBeenCalledWith(
        EMPLOYEE_SERVICE_URL,
        '/v1/positions/edit/1',
        expect.objectContaining({
          body: positionData
        }),
        expect.anything()
      );
    });
    
    test('PUT /contract-types/edit/:id harus memanggil forwardRequest dengan argumen yang benar', async () => {
      // Arrange
      const contractTypeData = { 
        name: 'Updated Contract Type', 
        duration: '24 months'
      };
      
      // Act
      const response = await request(app)
        .put('/v1/contract-types/edit/1')
        .send(contractTypeData);
      
      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('updated', true);
      expect(forwardRequest).toHaveBeenCalledWith(
        EMPLOYEE_SERVICE_URL,
        '/v1/contract-types/edit/1',
        expect.objectContaining({
          body: contractTypeData
        }),
        expect.anything()
      );
    });
    
    test('PATCH /employees/patch/:id harus memanggil forwardRequest dengan argumen yang benar', async () => {
      // Arrange
      const patchData = { 
        status: 'active'
      };
      
      // Act
      const response = await request(app)
        .patch('/v1/employees/patch/1')
        .send(patchData);
      
      // Assert
      expect(response.status).toBe(200);
      expect(forwardRequest).toHaveBeenCalledWith(
        EMPLOYEE_SERVICE_URL,
        '/v1/employees/patch/1',
        expect.objectContaining({
          body: patchData
        }),
        expect.anything()
      );
    });
    
    test('GET /employees/options harus memanggil forwardRequest dengan argumen yang benar', async () => {
      // Update mock implementation for this specific route
      forwardRequest.mockImplementationOnce((serviceUrl, path, req, res) => {
        res.status(200).json({ 
          options: [
            { id: '1', name: 'Employee 1' },
            { id: '2', name: 'Employee 2' }
          ]
        });
      });
      
      // Act
      const response = await request(app)
        .get('/v1/employees/options');
      
      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('options');
      expect(forwardRequest).toHaveBeenCalledWith(
        EMPLOYEE_SERVICE_URL,
        '/v1/employees/options',
        expect.anything(),
        expect.anything()
      );
    });
});