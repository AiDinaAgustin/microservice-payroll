const { forwardRequest } = require('../../utils/requestHandler');
const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');

// Create axios mock
const mock = new MockAdapter(axios);

describe('RequestHandler', () => {
  // Reset mocks after each test
  afterEach(() => {
    mock.reset();
  });

  // Test 1: Basic GET request
  test('Meneruskan permintaan GET dan mengembalikan respons berhasil', async () => {
    // Arrange
    const mockData = { message: 'Success' };
    mock.onGet('http://test-service/api/test').reply(200, mockData);
    
    const req = {
      method: 'GET',
      headers: { 'tenant-id': 'test-tenant' },
      query: {}
    };
    
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      end: jest.fn()
    };
    
    // Act
    await forwardRequest('http://test-service', '/api/test', req, res);
    
    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockData);
  });
});

// Test 2: POST request with body
test('Meneruskan permintaan POST dengan isi body', async () => {
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
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    end: jest.fn()
  };
  
  // Act
  await forwardRequest('http://test-service', '/api/users', req, res);
  
  // Assert
  expect(res.status).toHaveBeenCalledWith(201);
  expect(res.json).toHaveBeenCalledWith(mockResponse);
});

// Test 3: Request with query parameters
test('Meneruskan permintaan dengan parameter query', async () => {
  // Arrange
  const mockData = { data: [{ id: '1', name: 'Test' }] };
  mock.onGet('http://test-service/api/search').reply(config => {
    // Verify query params were passed correctly
    expect(config.params).toEqual({ q: 'test', page: '1' });
    return [200, mockData];
  });
  
  const req = {
    method: 'GET',
    headers: {},
    query: { q: 'test', page: '1' }
  };
  
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    end: jest.fn()
  };
  
  // Act
  await forwardRequest('http://test-service', '/api/search', req, res);
  
  // Assert
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith(mockData);
});

// Test 4: Handling 304 Not Modified
test('Menangani respons 304 Not Modified dengan benar', async () => {
  // Arrange
  mock.onGet('http://test-service/api/cached').reply(304);
  
  const req = {
    method: 'GET',
    headers: { 'if-none-match': '"abc123"' },
    query: {}
  };
  
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    end: jest.fn()
  };
  
  // Act
  await forwardRequest('http://test-service', '/api/cached', req, res);
  
  // Assert
  expect(res.status).toHaveBeenCalledWith(304);
  expect(res.json).not.toHaveBeenCalled();
  expect(res.end).toHaveBeenCalled();
});

