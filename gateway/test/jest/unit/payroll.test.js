const express = require('express');
const request = require('supertest');

// Mock dependencies
jest.mock('http-proxy-middleware', () => ({
  createProxyMiddleware: jest.fn(() => (req, res, next) => {
    res.status(200).json({ proxied: true });
  })
}));

// Update the mock implementation in your test file:
jest.mock('../../../utils/requestHandler', () => ({
  forwardRequest: jest.fn((serviceUrl, path, req, res) => {
    // Mock implementation based on the path
    if (path.includes('/v1/salaries/list')) {
      res.status(200).json({ 
        data: [{ id: '1', employee_id: '1', base_salary: 5000 }],
        pagination: { total: 1 }
      });
    } else if (path.includes('/v1/salaries/add')) {
      res.status(201).json({ id: '1', ...req.body, created: true });
    } else if (path.includes('/v1/salaries/detail/')) {
      const id = path.split('/').pop();
      res.status(200).json({ id, employee_id: '1', base_salary: 5000 });
    } else if (path.includes('/v1/salaries/edit/')) {
      res.status(200).json({ ...req.body, updated: true });
    } else if (path.includes('/v1/salaries/delete/')) {
      res.status(200).json({ deleted: true });
    } else if (path.includes('/v1/attendances/list')) {
      res.status(200).json({ 
        data: [{ id: '1', employee_id: '1', date: '2023-05-01', status: 'present' }],
        pagination: { total: 1 }
      });
    } else if (path.includes('/v1/attendances/add')) {
      res.status(201).json({ id: '1', ...req.body, created: true });
    } else if (path.includes('/v1/attendance-deductions/calculate')) {
      res.status(200).json({ calculated: true, amount: 500 });
    } else if (path.includes('/v1/attendance-deductions/generate')) {
      res.status(200).json({ generated: true, count: 10 });
    } else if (path.includes('/v1/attendance-deductions/list')) {
      // Fix for the attendance-deductions/list endpoint
      res.status(200).json({ 
        data: [{ id: '1', employee_id: '1', amount: 100, month: 5, year: 2023 }],
        pagination: { total: 1 }
      });
    } else if (path.includes('/v1/payslips/generate')) {
      res.status(200).json({ generated: true, count: 5 });
    } else if (path.includes('/v1/payslips/list')) {
      res.status(200).json({ 
        data: [{ id: '1', employee_id: '1', month: 5, year: 2023, net_salary: 4500 }],
        pagination: { total: 1 }
      });
    } else {
      res.status(404).json({ error: 'Not found' });
    }
  })
}));

// Import the mocks so we can access them in tests
const { createProxyMiddleware } = require('http-proxy-middleware');
const { forwardRequest } = require('../../../utils/requestHandler');

// Import the module under test
const createPayrollRouter = require('../../../routes/payroll');

describe('Payroll Routes', () => {
  let app;
  const PAYROLL_SERVICE_URL = 'http://mock-payroll-service';

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create a fresh Express app for each test
    app = express();
    app.use(express.json());
    
    // Mount the router
    const payrollRouter = createPayrollRouter(PAYROLL_SERVICE_URL);
    app.use('/v1', payrollRouter);
  });

  test('Harus menginisialisasi proxy middleware dengan opsi yang benar', () => {
    expect(createProxyMiddleware).toHaveBeenCalledWith({
      target: PAYROLL_SERVICE_URL,
      changeOrigin: true,
      pathRewrite: null,
      logLevel: 'debug',
      onError: expect.any(Function)
    });
  });

  // Salary routes tests
  describe('Salary Routes', () => {
    test('GET /salaries/list harus memanggil forwardRequest dengan argumen yang benar', async () => {
      // Act
      const response = await request(app)
        .get('/v1/salaries/list')
        .query({ page: 1, limit: 10 });
      
      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(forwardRequest).toHaveBeenCalledWith(
        PAYROLL_SERVICE_URL,
        '/v1/salaries/list',
        expect.anything(),
        expect.anything()
      );
    });

    test('POST /salaries/add harus memanggil forwardRequest dengan argumen yang benar', async () => {
      // Arrange
      const salaryData = { 
        employee_id: '1', 
        base_salary: 5000,
        allowance: 500
      };
      
      // Act
      const response = await request(app)
        .post('/v1/salaries/add')
        .send(salaryData);
      
      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('created', true);
      expect(forwardRequest).toHaveBeenCalledWith(
        PAYROLL_SERVICE_URL,
        '/v1/salaries/add',
        expect.objectContaining({
          body: salaryData
        }),
        expect.anything()
      );
    });

    test('GET /salaries/detail/:id harus memanggil forwardRequest dengan argumen yang benar', async () => {
      // Act
      const response = await request(app)
        .get('/v1/salaries/detail/1');
      
      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', '1');
      expect(forwardRequest).toHaveBeenCalledWith(
        PAYROLL_SERVICE_URL,
        '/v1/salaries/detail/1',
        expect.anything(),
        expect.anything()
      );
    });

    test('PUT /salaries/edit/:id harus memanggil forwardRequest dengan argumen yang benar', async () => {
      // Arrange
      const salaryData = { 
        base_salary: 5500,
        allowance: 600
      };
      
      // Act
      const response = await request(app)
        .put('/v1/salaries/edit/1')
        .send(salaryData);
      
      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('updated', true);
      expect(forwardRequest).toHaveBeenCalledWith(
        PAYROLL_SERVICE_URL,
        '/v1/salaries/edit/1',
        expect.objectContaining({
          body: salaryData
        }),
        expect.anything()
      );
    });

    test('DELETE /salaries/delete/:id harus memanggil forwardRequest dengan argumen yang benar', async () => {
      // Act
      const response = await request(app)
        .delete('/v1/salaries/delete/1');
      
      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('deleted', true);
      expect(forwardRequest).toHaveBeenCalledWith(
        PAYROLL_SERVICE_URL,
        '/v1/salaries/delete/1',
        expect.anything(),
        expect.anything()
      );
    });
  });

  // Attendance routes tests
  describe('Attendance Routes', () => {
    test('GET /attendances/list harus memanggil forwardRequest dengan argumen yang benar', async () => {
      // Act
      const response = await request(app)
        .get('/v1/attendances/list')
        .query({ month: 5, year: 2023 });
      
      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(forwardRequest).toHaveBeenCalledWith(
        PAYROLL_SERVICE_URL,
        '/v1/attendances/list',
        expect.anything(),
        expect.anything()
      );
    });

    test('POST /attendances/add harus memanggil forwardRequest dengan argumen yang benar', async () => {
      // Arrange
      const attendanceData = { 
        employee_id: '1', 
        date: '2023-05-01',
        status: 'present'
      };
      
      // Act
      const response = await request(app)
        .post('/v1/attendances/add')
        .send(attendanceData);
      
      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('created', true);
      expect(forwardRequest).toHaveBeenCalledWith(
        PAYROLL_SERVICE_URL,
        '/v1/attendances/add',
        expect.objectContaining({
          body: attendanceData
        }),
        expect.anything()
      );
    });
  });

  // Attendance Deduction routes tests
  describe('Attendance Deduction Routes', () => {
    test('POST /attendance-deductions/calculate harus memanggil forwardRequest dengan argumen yang benar', async () => {
      // Arrange
      const calculationData = { 
        employee_id: '1', 
        month: 5,
        year: 2023
      };
      
      // Act
      const response = await request(app)
        .post('/v1/attendance-deductions/calculate')
        .send(calculationData);
      
      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('calculated', true);
      expect(forwardRequest).toHaveBeenCalledWith(
        PAYROLL_SERVICE_URL,
        '/v1/attendance-deductions/calculate',
        expect.objectContaining({
          body: calculationData
        }),
        expect.anything()
      );
    });

    test('POST /attendance-deductions/generate harus memanggil forwardRequest dengan argumen yang benar', async () => {
      // Arrange
      const generateData = { 
        month: 5,
        year: 2023
      };
      
      // Act
      const response = await request(app)
        .post('/v1/attendance-deductions/generate')
        .send(generateData);
      
      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('generated', true);
      expect(forwardRequest).toHaveBeenCalledWith(
        PAYROLL_SERVICE_URL,
        '/v1/attendance-deductions/generate',
        expect.objectContaining({
          body: generateData
        }),
        expect.anything()
      );
    });

    test('GET /attendance-deductions/list harus memanggil forwardRequest dengan argumen yang benar', async () => {
      // Act
      const response = await request(app)
        .get('/v1/attendance-deductions/list')
        .query({ month: 5, year: 2023 });
      
      // Assert
      expect(response.status).toBe(200);
      expect(forwardRequest).toHaveBeenCalledWith(
        PAYROLL_SERVICE_URL,
        '/v1/attendance-deductions/list',
        expect.anything(),
        expect.anything()
      );
    });
  });

  // Payslip routes tests
  describe('Payslip Routes', () => {
    test('POST /payslips/generate harus memanggil forwardRequest dengan argumen yang benar', async () => {
      // Arrange
      const generateData = { 
        month: 5,
        year: 2023
      };
      
      // Act
      const response = await request(app)
        .post('/v1/payslips/generate')
        .send(generateData);
      
      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('generated', true);
      expect(forwardRequest).toHaveBeenCalledWith(
        PAYROLL_SERVICE_URL,
        '/v1/payslips/generate',
        expect.objectContaining({
          body: generateData
        }),
        expect.anything()
      );
    });

    test('GET /payslips/list harus memanggil forwardRequest dengan argumen yang benar', async () => {
      // Act
      const response = await request(app)
        .get('/v1/payslips/list')
        .query({ month: 5, year: 2023 });
      
      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(forwardRequest).toHaveBeenCalledWith(
        PAYROLL_SERVICE_URL,
        '/v1/payslips/list',
        expect.anything(),
        expect.anything()
      );
    });
  });

  // Error handling tests
  describe('Error Handling', () => {
    test('Harus menangani error dari payroll service', async () => {
      // Arrange
      forwardRequest.mockImplementationOnce((serviceUrl, path, req, res) => {
        res.status(500).json({ error: 'Service error', message: 'Database connection failed' });
      });
      
      // Act
      const response = await request(app)
        .get('/v1/salaries/list');
      
      // Assert
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Service error');
    });

    // test('proxy middleware should handle errors', async () => {
    // // Reset the mock first
    // createProxyMiddleware.mockReset();
    
    // // Create a mock that directly triggers the error handler
    // createProxyMiddleware.mockImplementation(options => {
    //     // Extract the error handler
    //     const errorHandler = options.onError;
        
    //     // Return middleware that calls the error handler immediately
    //     return (req, res, next) => {
    //     // Create an error and call the handler directly
    //     const error = new Error('Connection refused');
    //     errorHandler(error, req, res);
    //     };
    // });
    
    // // Create a fresh app with our modified mock
    // const errorApp = express();
    // errorApp.use(express.json());
    // const payrollRouter = createPayrollRouter(PAYROLL_SERVICE_URL);
    // errorApp.use('/v1', payrollRouter);
    
    // // Make request to a route that uses the proxy
    // const response = await request(errorApp)
    //     .get('/v1/payroll/dashboard');
    
    // // Verify error handling
    // expect(response.status).toBe(500);
    // expect(response.body).toHaveProperty('error', 'Error communicating with payroll service');
    // expect(response.body).toHaveProperty('details', 'Connection refused');
    // });
  });

  // Test the fallback proxy routes
  test('Rute proxy harus menggunakan proxy middleware', async () => {
    // Test various routes that should use proxy middleware
    const routesToTest = [
      '/v1/payroll/dashboard',
      '/v1/payroll/stats'
    ];

    for (const route of routesToTest) {
      // Reset forwardRequest mock to ensure it's not been called before this test
      forwardRequest.mockClear();
      
      // Act
      const response = await request(app).get(route);
      
      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('proxied', true);
      // forwardRequest should not be called for these routes
      expect(forwardRequest).not.toHaveBeenCalled();
    }
  });

  test('GET /attendance-deductions/detail/:id harus memanggil forwardRequest dengan argumen yang benar', async () => {
    // Update mock implementation for this specific route
    forwardRequest.mockImplementationOnce((serviceUrl, path, req, res) => {
      if (path.includes('/v1/attendance-deductions/detail/')) {
        const id = path.split('/').pop();
        res.status(200).json({ 
          id, 
          employee_id: '1', 
          amount: 150, 
          month: 5, 
          year: 2023 
        });
      }
    });
    
    // Act
    const response = await request(app)
      .get('/v1/attendance-deductions/detail/1');
    
    // Assert
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', '1');
    expect(forwardRequest).toHaveBeenCalledWith(
      PAYROLL_SERVICE_URL,
      '/v1/attendance-deductions/detail/1',
      expect.anything(),
      expect.anything()
    );
  });
  
  test('DELETE /attendance-deductions/delete/:id harus memanggil forwardRequest dengan argumen yang benar', async () => {
    // Update mock implementation for this specific route
    forwardRequest.mockImplementationOnce((serviceUrl, path, req, res) => {
      if (path.includes('/v1/attendance-deductions/delete/')) {
        res.status(200).json({ deleted: true });
      }
    });
    
    // Act
    const response = await request(app)
      .delete('/v1/attendance-deductions/delete/1');
    
    // Assert
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('deleted', true);
    expect(forwardRequest).toHaveBeenCalledWith(
      PAYROLL_SERVICE_URL,
      '/v1/attendance-deductions/delete/1',
      expect.anything(),
      expect.anything()
    );
  });
  
  // Tambahkan test ini di dalam describe('Payslip Routes', ...)
  test('GET /payslips/detail/:id harus memanggil forwardRequest dengan argumen yang benar', async () => {
    // Update mock implementation for this specific route
    forwardRequest.mockImplementationOnce((serviceUrl, path, req, res) => {
      if (path.includes('/v1/payslips/detail/')) {
        const id = path.split('/').pop();
        res.status(200).json({ 
          id, 
          employee_id: '1', 
          month: 5, 
          year: 2023, 
          net_salary: 4500 
        });
      }
    });
    
    // Act
    const response = await request(app)
      .get('/v1/payslips/detail/1');
    
    // Assert
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', '1');
    expect(forwardRequest).toHaveBeenCalledWith(
      PAYROLL_SERVICE_URL,
      '/v1/payslips/detail/1',
      expect.anything(),
      expect.anything()
    );
  });
  
  test('POST /payslips/add harus memanggil forwardRequest dengan argumen yang benar', async () => {
    // Update mock implementation for this specific route
    forwardRequest.mockImplementationOnce((serviceUrl, path, req, res) => {
      if (path === '/v1/payslips/add') {
        res.status(201).json({ id: '1', ...req.body, created: true });
      }
    });
    
    // Arrange
    const payslipData = { 
      employee_id: '1',
      month: 5,
      year: 2023,
      base_salary: 5000
    };
    
    // Act
    const response = await request(app)
      .post('/v1/payslips/add')
      .send(payslipData);
    
    // Assert
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('created', true);
    expect(forwardRequest).toHaveBeenCalledWith(
      PAYROLL_SERVICE_URL,
      '/v1/payslips/add',
      expect.objectContaining({
        body: payslipData
      }),
      expect.anything()
    );
  });
  
  // Aktifkan test ini di dalam describe('Error Handling', ...) dengan membuang komentar
    test('proxy error handler sets correct status and response', () => {
    // Create mocks
    const err = new Error('Connection refused');
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    // Extract error handler function
    let errorHandler;
    createProxyMiddleware.mockImplementationOnce(options => {
      errorHandler = options.onError;
      return () => {};
    });
    
    // Create router to get the error handler
    createPayrollRouter(PAYROLL_SERVICE_URL);
    
    // Call error handler directly
    errorHandler(err, req, res);
    
    // Verify behavior
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Error communicating with payroll service',
      details: 'Connection refused'
    });
  });
});