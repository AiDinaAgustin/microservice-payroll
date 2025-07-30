const chai = require('chai');
const { expect } = chai;
const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
const sinon = require('sinon');
const { 
  forwardRequest, 
  forwardRequestWithFailover, 
  checkServiceHealth, 
  getServiceMapping 
} = require('../../../utils/requestHandler');

// Create axios mock
const mock = new MockAdapter(axios);

describe('RequestHandler (Mocha/Chai)', () => {
  // Mock console methods
  beforeEach(() => {
    sinon.stub(console, 'log');
    sinon.stub(console, 'error');
    sinon.stub(console, 'warn');
  });

  // Reset mocks after each test
  afterEach(() => {
    mock.reset();
    sinon.restore();
  });

  describe('forwardRequest', () => {
    it('Meneruskan permintaan GET dan mengembalikan respons berhasil', async () => {
      // Arrange
      const mockData = { message: 'Success' };
      mock.onGet('http://test-service/api/test').reply(200, mockData);
      
      const req = {
        method: 'GET',
        headers: { 'tenant-id': 'test-tenant' },
        query: {}
      };
      
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
        end: sinon.stub(),
        headersSent: false
      };
      
      // Act
      await forwardRequest('http://test-service', '/api/test', req, res);
      
      // Assert
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith(mockData)).to.be.true;
    });

    it('Meneruskan permintaan POST dengan isi body', async () => {
      // Arrange
      const requestBody = { name: 'Test User', email: 'test@example.com' };
      const mockResponse = { id: '123', success: true };
      
      mock.onPost('http://test-service/api/users', requestBody).reply(201, mockResponse);
      
      const req = {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: requestBody,
        query: {}
      };
      
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
        end: sinon.stub(),
        headersSent: false
      };
      
      // Act
      await forwardRequest('http://test-service', '/api/users', req, res);
      
      // Assert
      expect(res.status.calledWith(201)).to.be.true;
      expect(res.json.calledWith(mockResponse)).to.be.true;
    });

    it('Meneruskan permintaan dengan parameter query', async () => {
      // Arrange
      const mockData = { data: [{ id: '1', name: 'Test' }] };
      mock.onGet('http://test-service/api/search').reply(config => {
        // Verify query params were passed correctly
        expect(config.params).to.deep.equal({ q: 'test', page: '1' });
        return [200, mockData];
      });
      
      const req = {
        method: 'GET',
        headers: {},
        query: { q: 'test', page: '1' }
      };
      
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
        end: sinon.stub(),
        headersSent: false
      };
      
      // Act
      await forwardRequest('http://test-service', '/api/search', req, res);
      
      // Assert
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith(mockData)).to.be.true;
    });

    it('Menangani respons 304 Not Modified dengan benar', async () => {
      // Arrange
      mock.onGet('http://test-service/api/cached').reply(304, undefined);
      
      const req = {
        method: 'GET',
        headers: { 'if-none-match': '"abc123"' },
        query: {}
      };
      
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
        end: sinon.stub(),
        headersSent: false
      };
      
      // Act
      await forwardRequest('http://test-service', '/api/cached', req, res);
      
      // Assert
      expect(res.status.calledWith(304)).to.be.true;
      expect(res.json.calledWith(undefined)).to.be.true;
    });

    it('Menangani unggahan file dengan benar', async () => {
      // Arrange
      const mockResponse = { uploaded: true, filename: 'test.csv' };
      mock.onPost('http://test-service/api/upload').reply(config => {
        // Verify the Content-Type header was set correctly
        expect(config.headers['Content-Type']).to.include('multipart/form-data');
        return [200, mockResponse];
      });
      
      const req = {
        method: 'POST',
        headers: {},
        query: {},
        file: {
          buffer: Buffer.from('test,data\n1,2'),
          originalname: 'test.csv',
          mimetype: 'text/csv'
        }
      };
      
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
        end: sinon.stub(),
        headersSent: false
      };
      
      // Act
      await forwardRequest('http://test-service', '/api/upload', req, res);
      
      // Assert
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith(mockResponse)).to.be.true;
    });

    it('Menangani unduhan file dengan benar', async () => {
      // Arrange
      const mockPipe = sinon.stub();
      const mockStream = { pipe: mockPipe };
      
      mock.onGet('http://test-service/api/download').reply(200, mockStream);
      
      const req = {
        method: 'GET',
        headers: {},
        query: { download: 'true' }
      };
      
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
        end: sinon.stub(),
        setHeader: sinon.stub(),
        headersSent: false
      };
      
      // Act
      await forwardRequest('http://test-service', '/api/download', req, res, {
        responseType: 'stream'
      });
      
      // Assert
      expect(mockPipe.calledWith(res)).to.be.true;
    });

    it('Menangani respons error dari service dengan benar', async () => {
      // Arrange
      const errorResponse = { 
        error: 'Validation Error', 
        fields: ['name', 'email'] 
      };
      
      mock.onPost('http://test-service/api/users').reply(400, errorResponse);
      
      const req = {
        method: 'POST',
        headers: {},
        body: { /* invalid data */ },
        query: {}
      };
      
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
        end: sinon.stub(),
        headersSent: false
      };
      
      // Act
      await forwardRequest('http://test-service', '/api/users', req, res);
      
      // Assert
      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledWith(errorResponse)).to.be.true;
    });

    it('Menangani ketika headers sudah dikirim', async () => {
      // Arrange
      const mockData = { message: 'Success' };
      mock.onGet('http://test-service/api/test').reply(200, mockData);
      
      const req = {
        method: 'GET',
        headers: {},
        query: {}
      };
      
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
        end: sinon.stub(),
        headersSent: true // Headers already sent
      };
      
      // Act
      await forwardRequest('http://test-service', '/api/test', req, res);
      
      // Assert
      expect(res.status.notCalled).to.be.true;
      expect(res.json.notCalled).to.be.true;
    });
  });

  describe('forwardRequestWithFailover', () => {
    it('Harus menggunakan primary service ketika tersedia', async () => {
      // Arrange
      const mockData = { data: [{ id: '1', name: 'Employee 1' }] };
      mock.onGet('http://localhost:5002/v1/employees/list').reply(200, mockData);
      
      const req = {
        method: 'GET',
        headers: {},
        query: {}
      };
      
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
        headersSent: false
      };
      
      // Act
      await forwardRequestWithFailover('http://localhost:5002', '/v1/employees/list', req, res);
      
      // Assert
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith(mockData)).to.be.true;
    });

    it('Harus failover ke fallback service ketika primary gagal', async () => {
      // Arrange
      const mockData = { data: [{ id: '1', name: 'Employee 1' }] };
      
      // Primary service fails
      mock.onGet('http://localhost:5002/v1/employees/list').networkError();
      // Fallback service succeeds
      mock.onGet('http://localhost:5003/v1/employees/list').reply(200, mockData);
      
      const req = {
        method: 'GET',
        headers: {},
        query: {}
      };
      
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
        headersSent: false
      };
      
      // Act
      await forwardRequestWithFailover('http://localhost:5002', '/v1/employees/list', req, res);
      
      // Assert
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith(mockData)).to.be.true;
    });

    it('Harus mengembalikan error 503 ketika semua service gagal', async () => {
      // Arrange
      // Both services fail
      mock.onGet('http://localhost:5002/v1/employees/list').networkError();
      mock.onGet('http://localhost:5003/v1/employees/list').networkError();
      
      const req = {
        method: 'GET',
        headers: {},
        query: {}
      };
      
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
        headersSent: false
      };
      
      // Act
      await forwardRequestWithFailover('http://localhost:5002', '/v1/employees/list', req, res);
      
      // Assert
      expect(res.status.calledWith(503)).to.be.true;
      expect(res.json.calledWith(
        sinon.match({
          error: 'Service Unavailable',
          message: sinon.match.string
        })
      )).to.be.true;
    });

    it('Harus menggunakan forwardRequest biasa untuk service tanpa failover', async () => {
      // Arrange
      const mockData = { message: 'Success' };
      mock.onGet('http://localhost:5001/v1/auth/verify').reply(200, mockData);
      
      const req = {
        method: 'GET',
        headers: {},
        query: {}
      };
      
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
        headersSent: false
      };
      
      // Act
      await forwardRequestWithFailover('http://localhost:5001', '/v1/auth/verify', req, res);
      
      // Assert
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith(mockData)).to.be.true;
    });
  });

  describe('checkServiceHealth', () => {
    it('Harus mengembalikan true untuk service yang sehat', async () => {
      // Arrange
      mock.onGet('http://test-service/health').reply(200, { status: 'healthy' });
      
      // Act
      const result = await checkServiceHealth('http://test-service');
      
      // Assert
      expect(result).to.be.true;
    });

    it('Harus mengembalikan false untuk service yang tidak sehat', async () => {
      // Arrange
      mock.onGet('http://test-service/health').reply(500);
      
      // Act
      const result = await checkServiceHealth('http://test-service');
      
      // Assert
      expect(result).to.be.false;
    });

    it('Harus mengembalikan false untuk service yang tidak dapat diakses', async () => {
      // Arrange
      mock.onGet('http://test-service/health').networkError();
      
      // Act
      const result = await checkServiceHealth('http://test-service');
      
      // Assert
      expect(result).to.be.false;
    });

    it('Harus mengembalikan false untuk respons 200 dengan status tidak healthy', async () => {
      // Arrange
      mock.onGet('http://test-service/health').reply(200, { status: 'unhealthy' });
      
      // Act
      const result = await checkServiceHealth('http://test-service');
      
      // Assert
      expect(result).to.be.false;
    });
  
    it('Harus mengembalikan false untuk respons tanpa status healthy', async () => {
      // Arrange
      mock.onGet('http://test-service/health').reply(200, { message: 'OK' }); // No status field
      
      // Act
      const result = await checkServiceHealth('http://test-service');
      
      // Assert
      expect(result).to.be.false;
    });
  });

  describe('getServiceMapping', () => {
    it('Harus mengembalikan mapping service yang benar', () => {
      // Act
      const mapping = getServiceMapping();
      
      // Assert
      expect(mapping).to.have.property('employees');
      expect(mapping).to.have.property('departments');
      expect(mapping).to.have.property('positions');
      expect(mapping).to.have.property('contract-types');
      expect(mapping).to.have.property('marital-status');
      
      expect(mapping.employees).to.have.property('primary');
      expect(mapping.employees).to.have.property('fallback');
    });

    it('Harus menggunakan environment variables atau default values', () => {
      // Arrange - temporarily modify environment variables
      const originalEnv = process.env;
      process.env = {
        ...originalEnv,
        EMPLOYEE_SERVICE_URL: 'http://custom-employee-service',
        PAYROLL_SERVICE_URL: 'http://custom-payroll-service'
      };
      
      // Act
      const mapping = getServiceMapping();
      
      // Assert
      expect(mapping.employees.primary).to.equal('http://custom-employee-service');
      expect(mapping.employees.fallback).to.equal('http://custom-payroll-service');
      
      // Restore environment
      process.env = originalEnv;
    });
  });

  describe('Logging', () => {
    it('Harus mencatat log untuk request yang berhasil', async () => {
      // Arrange
      const mockData = { message: 'Success' };
      mock.onGet('http://test-service/api/test').reply(200, mockData);
      
      const req = {
        method: 'GET',
        headers: {},
        query: {}
      };
      
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
        headersSent: false
      };
      
      // Act
      await forwardRequest('http://test-service', '/api/test', req, res);
      
      // Assert
      expect(console.log.calledWith('📤 Making request: GET http://test-service/api/test')).to.be.true;
      expect(console.log.calledWith('📥 Response received: 200')).to.be.true;
    });

    it('Harus mencatat log untuk failover analysis', async () => {
      // Arrange
      const mockData = { data: [] };
      mock.onGet('http://localhost:5002/v1/employees/list').reply(200, mockData);
      
      const req = {
        method: 'GET',
        headers: {},
        query: {}
      };
      
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
        headersSent: false
      };
      
      // Act
      await forwardRequestWithFailover('http://localhost:5002', '/v1/employees/list', req, res);
      
      // Assert
      expect(console.log.calledWith('🔍 Analyzing path: /v1/employees/list, extracted service type: employees')).to.be.true;
      expect(console.log.calledWith('🎯 Trying primary service for employees: http://localhost:5002')).to.be.true;
      expect(console.log.calledWith('✅ Primary service succeeded for employees')).to.be.true;
    });

    it('Harus mencatat semua error ketika primary dan fallback gagal', async () => {
      // Arrange
      // Both services should have network errors
      mock.onGet('http://localhost:5002/v1/employees/list').networkError();
      mock.onGet('http://localhost:5003/v1/employees/list').networkError();
      
      const req = {
        method: 'GET',
        headers: {},
        query: {}
      };
      
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
        headersSent: false
      };
      
      // Act
      await forwardRequestWithFailover('http://localhost:5002', '/v1/employees/list', req, res);
      
      // Assert
      expect(console.warn.calledWith('❌ Primary service failed for employees:', sinon.match.string)).to.be.true;
      expect(console.error.calledWith('💥 Both primary and fallback services failed for employees')).to.be.true;
      expect(console.error.calledWith('Primary error:', sinon.match.string)).to.be.true;
      expect(console.error.calledWith('Fallback error:', sinon.match.string)).to.be.true;
    });
  });

  describe('Edge Cases', () => {
    it('Harus menangani path dengan segment kosong', async () => {
      // Arrange
      const mockData = { message: 'Success' };
      mock.onGet('http://test-service/v1//empty').reply(200, mockData);
      
      const req = {
        method: 'GET',
        headers: {},
        query: {}
      };
      
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
        headersSent: false
      };
      
      // Act
      await forwardRequestWithFailover('http://test-service', '/v1//empty', req, res);
      
      // Assert
      expect(console.log.calledWith('🔍 Analyzing path: /v1//empty, extracted service type: ')).to.be.true;
      expect(console.log.calledWith('⚠️ No failover configured for , using original forward logic')).to.be.true;
    });

    it('Harus menangani headers sudah dikirim pada error response', async () => {
      // Arrange
      mock.onGet('http://test-service/api/error').reply(400, { error: 'Bad Request' });
      
      const req = {
        method: 'GET',
        headers: {},
        query: {}
      };
      
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
        headersSent: true // Headers already sent
      };
      
      // Act
      await forwardRequest('http://test-service', '/api/error', req, res);
      
      // Assert - should not call status or json when headers are already sent
      expect(res.status.notCalled).to.be.true;
      expect(res.json.notCalled).to.be.true;
    });
  });
});