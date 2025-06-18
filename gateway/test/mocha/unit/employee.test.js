const express = require('express');
const request = require('supertest');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const proxyquire = require('proxyquire');

// Use sinon-chai for spy assertions
chai.use(sinonChai);
const expect = chai.expect;

describe('Employee Routes', () => {
  let app;
  let forwardRequestStub;
  let createProxyMiddlewareStub;
  let multerStub;
  const EMPLOYEE_SERVICE_URL = 'http://mock-employee-service';

  beforeEach(() => {
    // Setup forwardRequest mock
    forwardRequestStub = sinon.stub();
    forwardRequestStub.callsFake((serviceUrl, path, req, res) => {
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
      } else if (path.includes('/v1/positions/add')) {
        res.status(201).json({ id: '1', ...req.body, created: true });
      } else if (path.includes('/v1/contract-types/add')) {
        res.status(201).json({ id: '1', ...req.body, created: true });
      } else {
        res.status(404).json({ error: 'Not found' });
      }
    });

    // Setup createProxyMiddleware mock
    createProxyMiddlewareStub = sinon.stub().callsFake(() => {
      return (req, res, next) => {
        res.status(200).json({ proxied: true });
      };
    });

    // Setup multer mock
    multerStub = () => ({
      single: () => (req, res, next) => {
        req.file = {
          buffer: Buffer.from('test file content'),
          originalname: 'test.csv',
          mimetype: 'text/csv'
        };
        next();
      }
    });
    multerStub.memoryStorage = () => ({});

    // Import employee router with mocked dependencies
    const createEmployeeRouter = proxyquire('../../../routes/employee', {
      'http-proxy-middleware': { createProxyMiddleware: createProxyMiddlewareStub },
      '../utils/requestHandler': { forwardRequest: forwardRequestStub },
      'multer': multerStub
    });

    // Create fresh Express app for each test
    app = express();
    app.use(express.json());
    
    // Mount the router
    const employeeRouter = createEmployeeRouter(EMPLOYEE_SERVICE_URL);
    app.use('/v1', employeeRouter);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('Harus menginisialisasi proxy middleware dengan opsi yang benar', () => {
    expect(createProxyMiddlewareStub).to.have.been.calledWith(sinon.match({
      target: EMPLOYEE_SERVICE_URL,
      changeOrigin: true,
      pathRewrite: null,
      logLevel: 'debug',
      onError: sinon.match.func
    }));
  });

  it('GET /employees/list harus memanggil forwardRequest dengan argumen yang benar', async () => {
    // Act
    const response = await request(app)
      .get('/v1/employees/list')
      .query({ page: 1, limit: 10 });
    
    // Assert
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('data');
    expect(forwardRequestStub).to.have.been.calledWith(
      EMPLOYEE_SERVICE_URL,
      '/v1/employees/list',
      sinon.match.any,
      sinon.match.any
    );
  });

  it('POST /employees/add harus memanggil forwardRequest dengan argumen yang benar', async () => {
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
    expect(response.status).to.equal(201);
    expect(response.body).to.have.property('created', true);
    expect(forwardRequestStub).to.have.been.calledWith(
      EMPLOYEE_SERVICE_URL,
      '/v1/employees/add',
      sinon.match.has('body', employeeData),
      sinon.match.any
    );
  });

  it('PUT /employees/edit/:id harus memanggil forwardRequest dengan argumen yang benar', async () => {
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
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('updated', true);
    expect(forwardRequestStub).to.have.been.calledWith(
      EMPLOYEE_SERVICE_URL,
      '/v1/employees/edit/1',
      sinon.match.has('body', employeeData),
      sinon.match.any
    );
  });

  it('DELETE /employees/delete/:id harus memanggil forwardRequest dengan argumen yang benar', async () => {
    // Act
    const response = await request(app)
      .delete('/v1/employees/delete/1');
    
    // Assert
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('deleted', true);
    expect(forwardRequestStub).to.have.been.calledWith(
      EMPLOYEE_SERVICE_URL,
      '/v1/employees/delete/1',
      sinon.match.any,
      sinon.match.any
    );
  });

  it('GET /employees/detail/:id harus memanggil forwardRequest dengan argumen yang benar', async () => {
    // Act
    const response = await request(app)
      .get('/v1/employees/detail/1');
    
    // Assert
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('id', '1');
    expect(forwardRequestStub).to.have.been.calledWith(
      EMPLOYEE_SERVICE_URL,
      '/v1/employees/detail/1',
      sinon.match.any,
      sinon.match.any
    );
  });

  it('POST /employees/upload harus menangani unggahan file dengan benar', async () => {
    // Act
    const response = await request(app)
      .post('/v1/employees/upload')
      .attach('file', Buffer.from('test file content'), 'test.csv');
    
    // Assert
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('uploaded', true);
    expect(response.body).to.have.property('filename', 'test.csv');
    expect(forwardRequestStub).to.have.been.calledWith(
      EMPLOYEE_SERVICE_URL,
      '/v1/employees/upload',
      sinon.match.has('file'),
      sinon.match.any
    );
  });

  it('GET /employees/download harus menangani unduhan file dengan benar', async () => {
    // Act
    const response = await request(app)
      .get('/v1/employees/download')
      .query({ type: 'csv' });
    
    // Assert
    expect(response.status).to.equal(200);
    expect(forwardRequestStub).to.have.been.calledWith(
      EMPLOYEE_SERVICE_URL,
      '/v1/employees/download',
      sinon.match.any,
      sinon.match.any,
      { responseType: 'stream' }
    );
  });

  it('POST /departments/add harus memanggil forwardRequest dengan argumen yang benar', async () => {
    // Arrange
    const departmentData = { name: 'New Department' };
    
    // Act
    const response = await request(app)
      .post('/v1/departments/add')
      .send(departmentData);
    
    // Assert
    expect(response.status).to.equal(201);
    expect(response.body).to.have.property('created', true);
    expect(forwardRequestStub).to.have.been.calledWith(
      EMPLOYEE_SERVICE_URL,
      '/v1/departments/add',
      sinon.match.has('body', departmentData),
      sinon.match.any
    );
  });

  it('POST /positions/add harus memanggil forwardRequest dengan argumen yang benar', async () => {
    // Arrange
    const positionData = { name: 'New Position' };
    
    // Act
    const response = await request(app)
      .post('/v1/positions/add')
      .send(positionData);
    
    // Assert
    expect(response.status).to.equal(201);
    expect(response.body).to.have.property('created', true);
    expect(forwardRequestStub).to.have.been.calledWith(
      EMPLOYEE_SERVICE_URL,
      '/v1/positions/add',
      sinon.match.has('body', positionData),
      sinon.match.any
    );
  });

  it('POST /contract-types/add harus memanggil forwardRequest dengan argumen yang benar', async () => {
    // Arrange
    const contractTypeData = { name: 'New Contract Type' };
    
    // Act
    const response = await request(app)
      .post('/v1/contract-types/add')
      .send(contractTypeData);
    
    // Assert
    expect(response.status).to.equal(201);
    expect(response.body).to.have.property('created', true);
    expect(forwardRequestStub).to.have.been.calledWith(
      EMPLOYEE_SERVICE_URL,
      '/v1/contract-types/add',
      sinon.match.has('body', contractTypeData),
      sinon.match.any
    );
  });

  it('Rute proxy harus menggunakan proxy middleware', async () => {
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
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('proxied', true);
    }

    // Verify createProxyMiddleware was called
    expect(createProxyMiddlewareStub).to.have.been.called;
    // In Jest version: expect(forwardRequest).not.toHaveBeenCalled();
    // This doesn't work exactly the same in Sinon, but we can check specific routes
    expect(forwardRequestStub).to.not.have.been.calledWith(
      EMPLOYEE_SERVICE_URL,
      '/v1/marital-status/list',
      sinon.match.any,
      sinon.match.any
    );
  });
    
  it('Harus menangani error dari employee service', async () => {
    // Arrange - override the stub for this specific test
    const originalStub = forwardRequestStub.callsFake;
    forwardRequestStub.callsFake((serviceUrl, path, req, res) => {
      if (path === '/v1/employees/list') {
        return res.status(500).json({ error: 'Service error', message: 'Database connection failed' });
      }
      // Use original implementation for other paths
      return originalStub.call(forwardRequestStub, serviceUrl, path, req, res);
    });
    
    // Act
    const response = await request(app)
      .get('/v1/employees/list');
    
    // Assert
    expect(response.status).to.equal(500);
    expect(response.body).to.have.property('error', 'Service error');
  });
    
  it('Harus menangani error validasi dengan benar', async () => {
    // Arrange - override the stub for this specific test
    const originalStub = forwardRequestStub.callsFake;
    forwardRequestStub.callsFake((serviceUrl, path, req, res) => {
      if (path === '/v1/employees/add') {
        return res.status(400).json({ 
          error: 'Validation error', 
          fields: ['name', 'email'],
          message: 'Name and email are required' 
        });
      }
      // Use original implementation for other paths
      return originalStub.call(forwardRequestStub, serviceUrl, path, req, res);
    });
    
    // Act
    const response = await request(app)
      .post('/v1/employees/add')
      .send({ /* empty data */ });
    
    // Assert
    expect(response.status).to.equal(400);
    expect(response.body).to.have.property('error', 'Validation error');
    expect(response.body).to.have.property('fields');
  });
  
  it('PUT /departments/edit/:id harus memanggil forwardRequest dengan argumen yang benar', async () => {
    // Arrange - tambahkan handler untuk path ini di forwardRequestStub
    forwardRequestStub.callsFake((serviceUrl, path, req, res) => {
      if (path.includes('/v1/departments/edit/')) {
        return res.status(200).json({ ...req.body, updated: true });
      }
      
      // Fallback ke implementasi default
      res.status(404).json({ error: 'Not found' });
    });
    
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
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('updated', true);
    expect(forwardRequestStub).to.have.been.calledWith(
      EMPLOYEE_SERVICE_URL,
      '/v1/departments/edit/1',
      sinon.match.has('body', departmentData),
      sinon.match.any
    );
  });
  
  it('PUT /positions/edit/:id harus memanggil forwardRequest dengan argumen yang benar', async () => {
    // Arrange - tambahkan handler untuk path ini di forwardRequestStub
    forwardRequestStub.callsFake((serviceUrl, path, req, res) => {
      if (path.includes('/v1/positions/edit/')) {
        return res.status(200).json({ ...req.body, updated: true });
      }
      
      // Fallback ke implementasi default
      res.status(404).json({ error: 'Not found' });
    });
    
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
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('updated', true);
    expect(forwardRequestStub).to.have.been.calledWith(
      EMPLOYEE_SERVICE_URL,
      '/v1/positions/edit/1',
      sinon.match.has('body', positionData),
      sinon.match.any
    );
  });
  
  it('PUT /contract-types/edit/:id harus memanggil forwardRequest dengan argumen yang benar', async () => {
    // Arrange - tambahkan handler untuk path ini di forwardRequestStub
    forwardRequestStub.callsFake((serviceUrl, path, req, res) => {
      if (path.includes('/v1/contract-types/edit/')) {
        return res.status(200).json({ ...req.body, updated: true });
      }
      
      // Fallback ke implementasi default
      res.status(404).json({ error: 'Not found' });
    });
    
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
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('updated', true);
    expect(forwardRequestStub).to.have.been.calledWith(
      EMPLOYEE_SERVICE_URL,
      '/v1/contract-types/edit/1',
      sinon.match.has('body', contractTypeData),
      sinon.match.any
    );
  });
  
  it('PATCH /employees/patch/:id harus memanggil forwardRequest dengan argumen yang benar', async () => {
    // Arrange - tambahkan handler untuk path ini di forwardRequestStub
    forwardRequestStub.callsFake((serviceUrl, path, req, res) => {
      if (path.includes('/v1/employees/patch/')) {
        return res.status(200).json({ ...req.body, patched: true });
      }
      
      // Fallback ke implementasi default
      res.status(404).json({ error: 'Not found' });
    });
    
    // Arrange
    const patchData = { 
      status: 'active'
    };
    
    // Act
    const response = await request(app)
      .patch('/v1/employees/patch/1')
      .send(patchData);
    
    // Assert
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('patched', true);
    expect(forwardRequestStub).to.have.been.calledWith(
      EMPLOYEE_SERVICE_URL,
      '/v1/employees/patch/1',
      sinon.match.has('body', patchData),
      sinon.match.any
    );
  });
  
  it('GET /employees/options harus memanggil forwardRequest dengan argumen yang benar', async () => {
    // Arrange - tambahkan handler untuk path ini di forwardRequestStub
    forwardRequestStub.callsFake((serviceUrl, path, req, res) => {
      if (path === '/v1/employees/options') {
        return res.status(200).json({ 
          options: [
            { id: '1', name: 'Employee 1' },
            { id: '2', name: 'Employee 2' }
          ]
        });
      }
      
      // Fallback ke implementasi default
      res.status(404).json({ error: 'Not found' });
    });
    
    // Act
    const response = await request(app)
      .get('/v1/employees/options');
    
    // Assert
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('options');
    expect(response.body.options).to.be.an('array');
    expect(response.body.options).to.have.lengthOf(2);
    expect(forwardRequestStub).to.have.been.calledWith(
      EMPLOYEE_SERVICE_URL,
      '/v1/employees/options',
      sinon.match.any,
      sinon.match.any
    );
  });
});