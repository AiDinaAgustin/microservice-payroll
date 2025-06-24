const { StatusCodes } = require('http-status-codes');
const axios = require('axios');

/**
 * Authorization check middleware for API gateway
 * Forwards token validation to auth service
 */
const authorizationCheck = (authServiceUrl) => async (req, res, next) => {
  const { authorization } = req.headers;

  try {
    if (typeof authorization !== 'string' || String(authorization).length < 1) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        status: StatusCodes.UNAUTHORIZED,
        message: 'Invalid bearer token',
      });
    }

    // Skip auth check for login endpoint
    if (req.originalUrl.includes('/auth/login')) {
      return next();
    }

    try {
      // Forward token validation to auth service
      await axios({
        method: 'post',
        url: `${authServiceUrl}/v1/auth/verify-token`,
        headers: {
          'Authorization': authorization
        }
      });

      // If no error was thrown, the token is valid
      next();
    } catch (error) {
      if (error.response) {
        return res.status(error.response.status).json(error.response.data);
      }

      return res.status(StatusCodes.UNAUTHORIZED).json({
        status: StatusCodes.UNAUTHORIZED,
        message: 'Invalid token or token expired',
      });
    }
  } catch (error) {
    const status = error.status || StatusCodes.INTERNAL_SERVER_ERROR;
    res.status(status).json({
      status,
      message: error.message || 'Internal server error during authorization check',
    });
  }
};

module.exports = authorizationCheck;