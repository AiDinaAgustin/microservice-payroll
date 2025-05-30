import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import notFound from '@middlewares/notFoundHandler';
import BaseError from '@responses/BaseError';

// Mock BaseError to inspect how it's called
jest.mock('@responses/BaseError', () => {
  return jest.fn().mockImplementation((params) => {
    return {
      status: params.status,
      message: params.message
    };
  });
});

describe('Not Found Handler Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    mockRequest = {
      originalUrl: '/non-existent-route'
    };
    mockResponse = {
      status: jest.fn().mockReturnThis()
    };
    jest.clearAllMocks();
  });

  it('should set status code to 404', () => {
    notFound(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
  });

  it('should create error with correct message', () => {
    notFound(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(BaseError).toHaveBeenCalledWith({
      status: StatusCodes.NOT_FOUND,
      message: `URL Not Found - /non-existent-route`
    });
  });

  it('should pass error to next middleware', () => {
    notFound(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(nextFunction).toHaveBeenCalled();
    expect(nextFunction).toHaveBeenCalledWith(expect.objectContaining({
      status: StatusCodes.NOT_FOUND
    }));
  });

  it('should handle different URL paths', () => {
  mockRequest.originalUrl = '/api/v1/users';
  
  notFound(mockRequest as Request, mockResponse as Response, nextFunction);
  
  expect(BaseError).toHaveBeenCalledWith({
    status: StatusCodes.NOT_FOUND,
    message: `URL Not Found - /api/v1/users`
  });
});

it('should integrate with error handler middleware', () => {
  // Integration test with error handler
  const errorHandler = jest.fn();
  
  notFound(mockRequest as Request, mockResponse as Response, errorHandler);
  
  expect(errorHandler).toHaveBeenCalledWith(
    expect.objectContaining({
      status: StatusCodes.NOT_FOUND,
      message: expect.stringContaining(mockRequest.originalUrl as string)
    })
  );
});
});