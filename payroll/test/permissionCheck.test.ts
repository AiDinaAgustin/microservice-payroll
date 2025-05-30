import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import PermissionCheck from '@middlewares/permissionCheck';
import fetchToken from '@utils/jwt';
import UserRepository from '../src/repositories/user/user';
import PermissionRepository from '../src/repositories/permission/permissionRepository';

jest.mock('@utils/jwt');
jest.mock('../src/repositories/user/user');
jest.mock('../src/repositories/permission/permissionRepository');

describe('Permission Check Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    mockRequest = {
      headers: {},
      originalUrl: '/v1/employees'
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  it('should return 401 when no authorization header', async () => {
    await PermissionCheck(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
  });

  it('should return 401 when token is invalid', async () => {
    mockRequest.headers = { authorization: 'Bearer invalid_token' };
    (fetchToken as jest.Mock).mockResolvedValueOnce(null);
    
    await PermissionCheck(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
  });

  it('should return 403 when permission not found', async () => {
    mockRequest.headers = { authorization: 'Bearer valid_token' };
    (fetchToken as jest.Mock).mockResolvedValueOnce({ 
      payload: { uid: 'test_user' } 
    });
    (UserRepository.findByUsername as jest.Mock).mockResolvedValueOnce({ 
      id: 'user_id', username: 'test_user', role_id: 'role_id' 
    });
    (PermissionRepository.findByRoleIdAndEndpoint as jest.Mock).mockResolvedValueOnce(null);
    
    await PermissionCheck(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.FORBIDDEN);
  });

//   REFACTOR
  it('should handle URL patterns with IDs', async () => {
  mockRequest.headers = { authorization: 'Bearer valid_token' };
  mockRequest.originalUrl = '/v1/employees/12345';
  
  (fetchToken as jest.Mock).mockResolvedValueOnce({ 
    payload: { uid: 'test_user' } 
  });
  (UserRepository.findByUsername as jest.Mock).mockResolvedValueOnce({ 
    id: 'user_id', username: 'test_user', role_id: 'role_id' 
  });
  (PermissionRepository.findByRoleIdAndEndpoint as jest.Mock).mockImplementation(
    (roleId, endpoint) => {
      // Verify endpoint was transformed correctly
      if (endpoint === '/employees/:id') {
        return Promise.resolve({ id: 'permission_id' });
      }
      return Promise.resolve(null);
    }
  );
  
  await PermissionCheck(mockRequest as Request, mockResponse as Response, nextFunction);
  expect(nextFunction).toHaveBeenCalled();
});

it('should handle UUID patterns', async () => {
  mockRequest.headers = { authorization: 'Bearer valid_token' };
  mockRequest.originalUrl = '/v1/employees/123e4567-e89b-12d3-a456-426614174000';
  
  (fetchToken as jest.Mock).mockResolvedValueOnce({ 
    payload: { uid: 'test_user' } 
  });
  (UserRepository.findByUsername as jest.Mock).mockResolvedValueOnce({ 
    id: 'user_id', username: 'test_user', role_id: 'role_id' 
  });
  (PermissionRepository.findByRoleIdAndEndpoint as jest.Mock).mockImplementation(
    (roleId, endpoint) => {
      if (endpoint === '/employees/:id') {
        return Promise.resolve({ id: 'permission_id' });
      }
      return Promise.resolve(null);
    }
  );
  
  await PermissionCheck(mockRequest as Request, mockResponse as Response, nextFunction);
  expect(nextFunction).toHaveBeenCalled();
});
});