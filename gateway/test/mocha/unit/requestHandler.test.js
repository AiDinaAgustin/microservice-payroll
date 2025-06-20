const chai = require('chai');
const { expect } = chai;
const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
const { forwardRequest } = require('../../../utils/requestHandler');
const sinon = require('sinon'); 

// Create a mock for axios
const mock = new MockAdapter(axios);

describe('RequestHandler (Mocha/Chai)', () => {
  // Reset mocks after each test
  afterEach(() => {
    mock.reset();
  });

  // Test 1: Basic GET request
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
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        this.body = data;
        return this;
      },
      end: function() {
        this.ended = true;
        return this;
      }
    };
    
    // Act
    await forwardRequest('http://test-service', '/api/test', req, res);
    
    // Assert
    expect(res.statusCode).to.equal(200);
    expect(res.body).to.deep.equal(mockData);
  });

  // Test 2: POST request with body
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
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        this.body = data;
        return this;
      },
      end: function() {
        this.ended = true;
        return this;
      }
    };
    
    // Act
    await forwardRequest('http://test-service', '/api/users', req, res);
    
    // Assert
    expect(res.statusCode).to.equal(201);
    expect(res.body).to.deep.equal(mockResponse);
  });

  // Test 3: Request with query parameters
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
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        this.body = data;
        return this;
      },
      end: function() {
        this.ended = true;
        return this;
      }
    };
    
    // Act
    await forwardRequest('http://test-service', '/api/search', req, res);
    
    // Assert
    expect(res.statusCode).to.equal(200);
    expect(res.body).to.deep.equal(mockData);
  });

  // Test 4: Handling 304 Not Modified
  it('Menangani respons 304 Not Modified dengan benar', async () => {
    // Arrange
    mock.onGet('http://test-service/api/cached').reply(304);
    
    const req = {
      method: 'GET',
      headers: { 'if-none-match': '"abc123"' },
      query: {}
    };
    
    const res = {
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        this.body = data;
        return this;
      },
      end: function() {
        this.ended = true;
        return this;
      }
    };
    
    // Act
    await forwardRequest('http://test-service', '/api/cached', req, res);
    
    // Assert
    expect(res.statusCode).to.equal(304);
    expect(res.ended).to.be.true;
    expect(res.body).to.be.undefined;
  });

    // Test 6: File upload handling
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
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        this.body = data;
        return this;
      },
      end: function() {
        this.ended = true;
        return this;
      },
      setHeader: function(name, value) {
        this.headers = this.headers || {};
        this.headers[name] = value;
      }
    };
    
    // Act
    await forwardRequest('http://test-service', '/api/upload', req, res);
    
    // Assert
    expect(res.statusCode).to.equal(200);
    expect(res.body).to.deep.equal(mockResponse);
  });

  // Test 7: File download handling
  it('Menangani unduhan file dengan benar', async () => {
    // Arrange
    const fileContent = Buffer.from('file content');
    
    // Mock the pipe method for the stream
    const mockPipe = sinon.stub();
    
    // Setup the axios mock for a file download
    mock.onGet('http://test-service/api/download').reply(() => {
      return [
        200, 
        { pipe: mockPipe }, // Mock a readable stream with pipe method
        { 
          'content-type': 'application/pdf',
          'content-disposition': 'attachment; filename="test.pdf"'
        }
      ];
    });
    
    const req = {
      method: 'GET',
      headers: {},
      query: { download: 'true' }
    };
    
    const res = {
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        this.body = data;
        return this;
      },
      end: function() {
        this.ended = true;
        return this;
      },
      setHeader: function(name, value) {
        this.headers = this.headers || {};
        this.headers[name] = value;
      }
    };
    
    // Act
    await forwardRequest('http://test-service', '/api/download', req, res);
    
    // Assert
    expect(res.headers['Content-Type']).to.equal('application/pdf');
    expect(res.headers['Content-Disposition']).to.equal('attachment; filename="test.pdf"');
    expect(mockPipe.calledWith(res)).to.be.true;
  });

  // Test 8: Error handling with structured error response
  it('Menangani respons error dari service dengan benar', async () => {
    // Arrange
    const errorResponse = { 
      error: 'Validation Error', 
      fields: ['name', 'email'] 
    };
    
    // Setup mock to return a 400 error
    mock.onPost('http://test-service/api/validation-error').reply(400, errorResponse);
    
    const req = {
      method: 'POST',
      headers: {},
      body: { /* invalid data */ },
      query: {}
    };
    
    const res = {
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        this.body = data;
        return this;
      },
      end: function() {
        this.ended = true;
        return this;
      }
    };
    
    // Stub console.error to prevent cluttering test output
    const consoleErrorStub = sinon.stub(console, 'error');
    
    // Act
    await forwardRequest('http://test-service', '/api/validation-error', req, res);
    
    // Restore console.error
    consoleErrorStub.restore();
    
    // Assert
    expect(res.statusCode).to.equal(400);
    expect(res.body).to.deep.equal(errorResponse);
  });

  // Test 9: Error handling without response (network error)
  it('Menangani error jaringan dengan benar', async () => {
    // Arrange
    // Setup mock to simulate a network error
    mock.onGet('http://test-service/api/network-error').networkError();
    
    const req = {
      method: 'GET',
      headers: {},
      query: {}
    };
    
    const res = {
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        this.body = data;
        return this;
      },
      end: function() {
        this.ended = true;
        return this;
      }
    };
    
    // Stub console.error to prevent cluttering test output
    const consoleErrorStub = sinon.stub(console, 'error');
    
    // Act
    await forwardRequest('http://test-service', '/api/network-error', req, res);
    
    // Restore console.error
    consoleErrorStub.restore();
    
    // Assert
    expect(res.statusCode).to.equal(500);
    expect(res.body).to.have.property('error', 'Error communicating with service');
    expect(res.body).to.have.property('details');
  });
});