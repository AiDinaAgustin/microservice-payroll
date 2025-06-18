const { forwardRequest } = require('../../../utils/requestHandler');
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

// Test 5: File upload handling
test('Menangani unggahan file dengan benar', async () => {
  // Arrange
  const mockResponse = { uploaded: true, filename: 'test.csv' };
  mock.onPost('http://test-service/api/upload').reply(config => {
    // Verify the Content-Type header was set correctly
    expect(config.headers['Content-Type']).toContain('multipart/form-data');
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
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    end: jest.fn()
  };
  
  // Act
  await forwardRequest('http://test-service', '/api/upload', req, res);
  
  // Assert
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith(mockResponse);
});

// Test 6: File download handling
test('Menangani unduhan file dengan benar', async () => {
  // Arrange
  const fileContent = Buffer.from('file content');
  
  // Mock the pipe method for the stream
  const mockPipe = jest.fn();
  
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
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    end: jest.fn(),
    setHeader: jest.fn()
  };
  
  // Act
  await forwardRequest('http://test-service', '/api/download', req, res);
  
  // Assert
  expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
  expect(res.setHeader).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename="test.pdf"');
  expect(mockPipe).toHaveBeenCalledWith(res);
});

// Test 7: Error handling with structured error response
test('Menangani respons error dari service dengan benar', async () => {
  // Arrange
  const errorResponse = { 
    error: 'Validation Error', 
    fields: ['name', 'email'] 
  };
  
  // Setup mock to return a 400 error
  mock.onPost('http://test-service/api/users').reply(400, errorResponse);
  
  const req = {
    method: 'POST',
    headers: {},
    body: { /* invalid data */ },
    query: {}
  };
  
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    end: jest.fn()
  };
  
  // Mock console.error to prevent cluttering test output
  const originalConsoleError = console.error;
  console.error = jest.fn();
  
  // Act
  await forwardRequest('http://test-service', '/api/users', req, res);
  
  // Restore console.error
  console.error = originalConsoleError;
  
  // Assert
  expect(res.status).toHaveBeenCalledWith(400);
  expect(res.json).toHaveBeenCalledWith(errorResponse);
});

// Test 8: Error handling without response (network error)
test('Menangani error jaringan dengan benar', async () => {
  // Arrange
  // Setup mock to simulate a network error
  mock.onGet('http://test-service/api/error').networkError();
  
  const req = {
    method: 'GET',
    headers: {},
    query: {}
  };
  
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    end: jest.fn()
  };
  
  // Mock console.error to prevent cluttering test output
  const originalConsoleError = console.error;
  console.error = jest.fn();
  
  // Act
  await forwardRequest('http://test-service', '/api/error', req, res);
  
  // Restore console.error
  console.error = originalConsoleError;
  
  // Assert
  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({
    error: 'Error communicating with service',
    details: expect.any(String)
  });
});
