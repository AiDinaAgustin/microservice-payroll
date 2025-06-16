const chai = require('chai');
const { expect } = chai;
const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
const { forwardRequest } = require('../../../utils/requestHandler');

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

  // Test 5: Handling error responses
  it('Menangani respons error dengan benar', async () => {
    // Arrange
    const errorResponse = { 
      error: 'Not Found', 
      message: 'Resource not found' 
    };
    
    mock.onGet('http://test-service/api/error').reply(404, errorResponse);
    
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
    
    // Act
    await forwardRequest('http://test-service', '/api/error', req, res);
    
    // Assert
    expect(res.statusCode).to.equal(404);
    expect(res.body).to.deep.equal(errorResponse);
  });
});