const express = require('express');
const request = require('supertest');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const proxyquire = require('proxyquire');

// Use sinon-chai for spy assertions
chai.use(sinonChai);
const expect = chai.expect;

describe('Payroll Routes', () => {
  let app;
  let forwardRequestStub;
  let createProxyMiddlewareStub;
  const PAYROLL_SERVICE_URL = 'http://mock-payroll-service';

  beforeEach(() => {
    // Setup createProxyMiddleware mock
    createProxyMiddlewareStub = sinon.stub().callsFake(() => {
      return (req, res, next) => {
        res.status(200).json({ proxied: true });
      };
    });
    
    // Setup forwardRequest mock
    forwardRequestStub = sinon.stub().callsFake((serviceUrl, path, req, res) => {
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
    });

    // Import payroll router with mocked dependencies
    const createPayrollRouter = proxyquire('../../../routes/payroll', {
      'http-proxy-middleware': { createProxyMiddleware: createProxyMiddlewareStub },
      '../utils/requestHandler': { forwardRequest: forwardRequestStub }
    });

    // Create fresh Express app for each test
    app = express();
    app.use(express.json());
    
    // Mount the router
    const payrollRouter = createPayrollRouter(PAYROLL_SERVICE_URL);
    app.use('/v1', payrollRouter);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('Harus menginisialisasi proxy middleware dengan opsi yang benar', () => {
    expect(createProxyMiddlewareStub).to.have.been.calledWith(sinon.match({
      target: PAYROLL_SERVICE_URL,
      changeOrigin: true,
      pathRewrite: null,
      logLevel: 'debug',
      onError: sinon.match.func
    }));
  });

  // Salary routes tests
  describe('Salary Routes', () => {
    it('GET /salaries/list harus memanggil forwardRequest dengan argumen yang benar', async () => {
      // Act
      const response = await request(app)
        .get('/v1/salaries/list')
        .query({ page: 1, limit: 10 });
      
      // Assert
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('data');
      expect(forwardRequestStub).to.have.been.calledWith(
        PAYROLL_SERVICE_URL,
        '/v1/salaries/list',
        sinon.match.any,
        sinon.match.any
      );
    });

    it('POST /salaries/add harus memanggil forwardRequest dengan argumen yang benar', async () => {
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
      expect(response.status).to.equal(201);
      expect(response.body).to.have.property('created', true);
      expect(forwardRequestStub).to.have.been.calledWith(
        PAYROLL_SERVICE_URL,
        '/v1/salaries/add',
        sinon.match.has('body', salaryData),
        sinon.match.any
      );
    });

    it('GET /salaries/detail/:id harus memanggil forwardRequest dengan argumen yang benar', async () => {
      // Act
      const response = await request(app)
        .get('/v1/salaries/detail/1');
      
      // Assert
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('id', '1');
      expect(forwardRequestStub).to.have.been.calledWith(
        PAYROLL_SERVICE_URL,
        '/v1/salaries/detail/1',
        sinon.match.any,
        sinon.match.any
      );
    });

    it('PUT /salaries/edit/:id harus memanggil forwardRequest dengan argumen yang benar', async () => {
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
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('updated', true);
      expect(forwardRequestStub).to.have.been.calledWith(
        PAYROLL_SERVICE_URL,
        '/v1/salaries/edit/1',
        sinon.match.has('body', salaryData),
        sinon.match.any
      );
    });

    it('DELETE /salaries/delete/:id harus memanggil forwardRequest dengan argumen yang benar', async () => {
      // Act
      const response = await request(app)
        .delete('/v1/salaries/delete/1');
      
      // Assert
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('deleted', true);
      expect(forwardRequestStub).to.have.been.calledWith(
        PAYROLL_SERVICE_URL,
        '/v1/salaries/delete/1',
        sinon.match.any,
        sinon.match.any
      );
    });
  });

  // Attendance routes tests
  describe('Attendance Routes', () => {
    it('GET /attendances/list harus memanggil forwardRequest dengan argumen yang benar', async () => {
      // Act
      const response = await request(app)
        .get('/v1/attendances/list')
        .query({ month: 5, year: 2023 });
      
      // Assert
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('data');
      expect(forwardRequestStub).to.have.been.calledWith(
        PAYROLL_SERVICE_URL,
        '/v1/attendances/list',
        sinon.match.any,
        sinon.match.any
      );
    });

    it('POST /attendances/add harus memanggil forwardRequest dengan argumen yang benar', async () => {
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
      expect(response.status).to.equal(201);
      expect(response.body).to.have.property('created', true);
      expect(forwardRequestStub).to.have.been.calledWith(
        PAYROLL_SERVICE_URL,
        '/v1/attendances/add',
        sinon.match.has('body', attendanceData),
        sinon.match.any
      );
    });
  });

  // Attendance Deduction routes tests
  describe('Attendance Deduction Routes', () => {
    it('POST /attendance-deductions/calculate harus memanggil forwardRequest dengan argumen yang benar', async () => {
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
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('calculated', true);
      expect(forwardRequestStub).to.have.been.calledWith(
        PAYROLL_SERVICE_URL,
        '/v1/attendance-deductions/calculate',
        sinon.match.has('body', calculationData),
        sinon.match.any
      );
    });

    it('POST /attendance-deductions/generate harus memanggil forwardRequest dengan argumen yang benar', async () => {
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
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('generated', true);
      expect(forwardRequestStub).to.have.been.calledWith(
        PAYROLL_SERVICE_URL,
        '/v1/attendance-deductions/generate',
        sinon.match.has('body', generateData),
        sinon.match.any
      );
    });

    it('GET /attendance-deductions/list harus memanggil forwardRequest dengan argumen yang benar', async () => {
      // Act
      const response = await request(app)
        .get('/v1/attendance-deductions/list')
        .query({ month: 5, year: 2023 });
      
      // Assert
      expect(response.status).to.equal(200);
      expect(forwardRequestStub).to.have.been.calledWith(
        PAYROLL_SERVICE_URL,
        '/v1/attendance-deductions/list',
        sinon.match.any,
        sinon.match.any
      );
    });
  });

  // Payslip routes tests
  describe('Payslip Routes', () => {
    it('POST /payslips/generate harus memanggil forwardRequest dengan argumen yang benar', async () => {
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
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('generated', true);
      expect(forwardRequestStub).to.have.been.calledWith(
        PAYROLL_SERVICE_URL,
        '/v1/payslips/generate',
        sinon.match.has('body', generateData),
        sinon.match.any
      );
    });

    it('GET /payslips/list harus memanggil forwardRequest dengan argumen yang benar', async () => {
      // Act
      const response = await request(app)
        .get('/v1/payslips/list')
        .query({ month: 5, year: 2023 });
      
      // Assert
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('data');
      expect(forwardRequestStub).to.have.been.calledWith(
        PAYROLL_SERVICE_URL,
        '/v1/payslips/list',
        sinon.match.any,
        sinon.match.any
      );
    });
  });

  // Error handling tests
  describe('Error Handling', () => {
    it('Harus menangani error dari payroll service', async () => {
      // Arrange - override the stub for this specific test
      const originalStub = forwardRequestStub.callsFake;
      forwardRequestStub.callsFake((serviceUrl, path, req, res) => {
        if (path === '/v1/salaries/list') {
          return res.status(500).json({ error: 'Service error', message: 'Database connection failed' });
        }
        // Use original implementation for other paths
        return originalStub.call(forwardRequestStub, serviceUrl, path, req, res);
      });
      
      // Act
      const response = await request(app)
        .get('/v1/salaries/list');
      
      // Assert
      expect(response.status).to.equal(500);
      expect(response.body).to.have.property('error', 'Service error');
    });
  });

  // Test the fallback proxy routes
  it('Rute proxy harus menggunakan proxy middleware', async () => {
    // Test various routes that should use proxy middleware
    const routesToTest = [
      '/v1/payroll/dashboard',
      '/v1/payroll/stats'
    ];

    for (const route of routesToTest) {
      // Reset the call history of forwardRequestStub
      forwardRequestStub.resetHistory();
      
      // Act
      const response = await request(app).get(route);
      
      // Assert
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('proxied', true);
      // forwardRequest should not be called for these routes
      expect(forwardRequestStub).to.not.have.been.called;
    }
  });
  
  it('GET /attendance-deductions/detail/:id harus memanggil forwardRequest dengan argumen yang benar', async () => {
    // Arrange - tambahkan handler untuk path ini di forwardRequestStub
    forwardRequestStub.callsFake((serviceUrl, path, req, res) => {
      if (path.includes('/v1/attendance-deductions/detail/')) {
        const id = path.split('/').pop();
        return res.status(200).json({ 
          id, 
          employee_id: '1', 
          amount: 150, 
          month: 5, 
          year: 2023 
        });
      }
      
      // Fallback ke implementasi default
      res.status(404).json({ error: 'Not found' });
    });
    
    // Act
    const response = await request(app)
      .get('/v1/attendance-deductions/detail/1');
    
    // Assert
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('id', '1');
    expect(forwardRequestStub).to.have.been.calledWith(
      PAYROLL_SERVICE_URL,
      '/v1/attendance-deductions/detail/1',
      sinon.match.any,
      sinon.match.any
    );
  });
  
  it('DELETE /attendance-deductions/delete/:id harus memanggil forwardRequest dengan argumen yang benar', async () => {
    // Arrange - tambahkan handler untuk path ini di forwardRequestStub
    forwardRequestStub.callsFake((serviceUrl, path, req, res) => {
      if (path.includes('/v1/attendance-deductions/delete/')) {
        return res.status(200).json({ deleted: true });
      }
      
      // Fallback ke implementasi default
      res.status(404).json({ error: 'Not found' });
    });
    
    // Act
    const response = await request(app)
      .delete('/v1/attendance-deductions/delete/1');
    
    // Assert
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('deleted', true);
    expect(forwardRequestStub).to.have.been.calledWith(
      PAYROLL_SERVICE_URL,
      '/v1/attendance-deductions/delete/1',
      sinon.match.any,
      sinon.match.any
    );
  });
  
  // Tambahkan test-test berikut ke dalam describe('Payslip Routes', ...)
  
  it('GET /payslips/detail/:id harus memanggil forwardRequest dengan argumen yang benar', async () => {
    // Arrange - tambahkan handler untuk path ini di forwardRequestStub
    forwardRequestStub.callsFake((serviceUrl, path, req, res) => {
      if (path.includes('/v1/payslips/detail/')) {
        const id = path.split('/').pop();
        return res.status(200).json({ 
          id, 
          employee_id: '1', 
          month: 5, 
          year: 2023, 
          net_salary: 4500 
        });
      }
      
      // Fallback ke implementasi default
      res.status(404).json({ error: 'Not found' });
    });
    
    // Act
    const response = await request(app)
      .get('/v1/payslips/detail/1');
    
    // Assert
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('id', '1');
    expect(forwardRequestStub).to.have.been.calledWith(
      PAYROLL_SERVICE_URL,
      '/v1/payslips/detail/1',
      sinon.match.any,
      sinon.match.any
    );
  });
  
  it('POST /payslips/add harus memanggil forwardRequest dengan argumen yang benar', async () => {
    // Arrange - tambahkan handler untuk path ini di forwardRequestStub
    forwardRequestStub.callsFake((serviceUrl, path, req, res) => {
      if (path === '/v1/payslips/add') {
        return res.status(201).json({ id: '1', ...req.body, created: true });
      }
      
      // Fallback ke implementasi default
      res.status(404).json({ error: 'Not found' });
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
    expect(response.status).to.equal(201);
    expect(response.body).to.have.property('created', true);
    expect(forwardRequestStub).to.have.been.calledWith(
      PAYROLL_SERVICE_URL,
      '/v1/payslips/add',
      sinon.match.has('body', payslipData),
      sinon.match.any
    );
  });
  
  // Tambahkan test ini ke describe('Error Handling', ...) untuk menguji proxy error handler langsung
  
  it('proxy error handler sets correct status and response', () => {
    // Create mocks
    const err = new Error('Connection refused');
    const req = {};
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub()
    };
    
    // Extract error handler function
    let errorHandler;
    createProxyMiddlewareStub.callsFake(options => {
      errorHandler = options.onError;
      return () => {};
    });
    
    // Create router to get the error handler
    const createPayrollRouter = proxyquire('../../../routes/payroll', {
      'http-proxy-middleware': { createProxyMiddleware: createProxyMiddlewareStub },
      '../utils/requestHandler': { forwardRequest: forwardRequestStub }
    });
    
    createPayrollRouter(PAYROLL_SERVICE_URL);
    
    // Call error handler directly
    errorHandler(err, req, res);
    
    // Verify behavior
    expect(res.status).to.have.been.calledWith(500);
    expect(res.json).to.have.been.calledWith({
      error: 'Error communicating with payroll service',
      details: 'Connection refused'
    });
  });
});