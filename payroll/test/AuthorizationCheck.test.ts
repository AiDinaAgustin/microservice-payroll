import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import AuthorizationCheck from '@middlewares/Auth';
import fetchToken from '@utils/jwt';
import UserRepository from '../src/repositories/user/user';

jest.mock('@utils/jwt');
jest.mock('../src/repositories/user/user');

describe('AuthorizationCheck Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    mockRequest = { headers: {} };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  it('should return 401 when no authorization header', async () => {
    await AuthorizationCheck(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
  });

  it('should return 401 when token format is invalid', async () => {
    mockRequest.headers = { authorization: 'InvalidToken' };
    await AuthorizationCheck(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
  });

  it('should return 401 when token is invalid', async () => {
    mockRequest.headers = { authorization: 'Bearer invalid_token' };
    (fetchToken as jest.Mock).mockResolvedValueOnce(null);
    
    await AuthorizationCheck(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
  });

  it('should proceed when token is valid', async () => {
    mockRequest.headers = { authorization: 'Bearer valid_token' };
    (fetchToken as jest.Mock).mockResolvedValueOnce({ 
      payload: { 
        uid: 'test_user',
        exp: Date.now() + 3600000 
      } 
    });
    (UserRepository.findByUsername as jest.Mock).mockResolvedValueOnce({ id: '1', username: 'test_user' });

    await AuthorizationCheck(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(nextFunction).toHaveBeenCalled();
  });
});

// red
// describe('AuthorizationCheck Middleware', () => {
//   let mockRequest: Partial<Request>;
//   let mockResponse: Partial<Response>;
//   let nextFunction: NextFunction = jest.fn();

//   beforeEach(() => {
//     mockRequest = { headers: {} };
//     mockResponse = {
//       status: jest.fn().mockReturnThis(),
//       json: jest.fn()
//     };
//     jest.clearAllMocks();
//   });

//   // RED: This test will fail because no implementation yet
//   it('should return 401 when no authorization header', async () => {
//     await AuthorizationCheck(mockRequest as Request, mockResponse as Response, nextFunction);
//     expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
//   });
// });