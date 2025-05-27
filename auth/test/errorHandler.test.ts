import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import errorHandler from '@middlewares/errorHandler';
import BaseError from '@responses/BaseError';

describe('Error Handler Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  it('should handle BaseError with status and message', () => {
    const error = new BaseError({
      status: StatusCodes.BAD_REQUEST,
      message: 'Test error'
    });

    errorHandler(
      error,
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: StatusCodes.BAD_REQUEST,
      message: 'Test error'
    });
  });

  it('should handle unknown errors with 500 status', () => {
    const error = new Error('Unknown error');

    errorHandler(
      error as BaseError,
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: 'Unknown error'
    });
  });

  it('should handle errors with custom status codes', () => {
  const error = new BaseError({
    status: StatusCodes.NOT_FOUND,
    message: 'Resource not found'
  });

  errorHandler(
    error,
    mockRequest as Request,
    mockResponse as Response,
    nextFunction
  );

  expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
  expect(mockResponse.json).toHaveBeenCalledWith({
    status: StatusCodes.NOT_FOUND,
    message: 'Resource not found'
  });
});

it('should handle validation errors', () => {
  const error = new BaseError({
    status: StatusCodes.UNPROCESSABLE_ENTITY,
    message: 'Validation failed',
    errors: ['Field is required']
  });

  errorHandler(
    error,
    mockRequest as Request,
    mockResponse as Response,
    nextFunction
  );

  expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.UNPROCESSABLE_ENTITY);
  expect(mockResponse.json).toHaveBeenCalledWith({
    status: StatusCodes.UNPROCESSABLE_ENTITY,
    message: 'Validation failed',
    errors: ['Field is required']
  });
});
});