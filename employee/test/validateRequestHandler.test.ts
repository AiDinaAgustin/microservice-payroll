// RED
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import validateRequestHandler from '@middlewares/validateRequestHandler';
import { object, string } from 'yup';
import BaseError from '@responses/BaseError';

// Mock BaseError
jest.mock('@responses/BaseError', () => {
  return jest.fn().mockImplementation((params) => {
    return {
      status: params.status,
      message: params.message
    };
  });
});

describe('Validate Request Handler Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    mockRequest = {
      headers: {},
      body: {}
    };
    mockResponse = {};
    jest.clearAllMocks();
  });

  it('should call next() when validation passes', async () => {
    // Define a test schema
    const schema = object({
      body: object({
        name: string().required()
      })
    });

    // Set up request to pass validation
    mockRequest.body = { name: 'John Doe' };

    // Create the middleware function
    const middleware = validateRequestHandler(schema);

    // Call the middleware
    await middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    // Expect next to be called with no arguments
    expect(nextFunction).toHaveBeenCalledWith();
  });

  it('should call next() with error when validation fails', async () => {
    // Define a test schema
    const schema = object({
      body: object({
        name: string().required()
      })
    });

    // Set up request to fail validation (missing required field)
    mockRequest.body = {};

    // Create the middleware function
    const middleware = validateRequestHandler(schema);

    // Call the middleware
    await middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    // Expect BaseError constructor to be called with correct params
    expect(BaseError).toHaveBeenCalledWith({
      status: StatusCodes.BAD_REQUEST,
      message: expect.stringContaining('required')
    });

    // Expect next to be called with an error
    expect(nextFunction).toHaveBeenCalledWith(expect.any(Object));
  });

//  REFACTOR
it('should handle multiple validation errors', async () => {
  const schema = object({
    body: object({
      name: string().required(),
      email: string().email().required()
    })
  });

  mockRequest.body = {}; // Missing both required fields

  const middleware = validateRequestHandler(schema);
  await middleware(mockRequest as Request, mockResponse as Response, nextFunction);

  // Check that we get multiple errors joined with commas
  expect(BaseError).toHaveBeenCalledWith({
    status: StatusCodes.BAD_REQUEST,
    message: expect.stringMatching(/.*required.*required.*/) // Multiple error messages
  });
});

it('should respect custom validation options', async () => {
  const schema = object({
    body: object({
      name: string().required(),
      extraField: string()
    })
  });

  // Include an unknown field that would normally be allowed but we'll restrict it
  mockRequest.body = { 
    name: 'John Doe',
    unknownField: 'this should cause an error' 
  };

  const customOptions = { 
    strict: true, 
    stripUnknown: true // Override the default false
  };

  const middleware = validateRequestHandler(schema, customOptions);
  await middleware(mockRequest as Request, mockResponse as Response, nextFunction);

  // Test passes if next is called without error
  expect(nextFunction).toHaveBeenCalledWith();
});
});