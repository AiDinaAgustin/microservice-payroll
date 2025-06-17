const { StatusCodes } = require('http-status-codes');
const { parse } = require('url');
const axios = require('axios');

/**
 * Permission check middleware for API gateway
 * Forwards permission checks to auth service
 */
const permissionCheck = (authServiceUrl) => async (req, res, next) => {
  const { authorization } = req.headers;

  try {
    if (typeof authorization !== 'string' || String(authorization).length < 1) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        status: StatusCodes.UNAUTHORIZED,
        message: 'Invalid bearer token',
      });
    }

    const { originalUrl, method } = req;

    // Skip permission check for login endpoint
    if (originalUrl.includes('/auth/login')) {
      return next();
    }

    try {
      // Extract endpoint path for permission check
      const parsedUrl = parse(originalUrl);
      let endpoint = parsedUrl.pathname || '';

      // Replace UUIDs and numeric IDs with :id parameter for permission matching
      endpoint = endpoint.replace(/\/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}|\d+)/g, '/:id');

      // Forward permission check to auth service
      await axios({
        method: 'post',
        url: `${authServiceUrl}/v1/auth/check-permission`,
        headers: {
          'Authorization': authorization
        },
        data: {
          endpoint,
          method
        }
      });

      next();
    } catch (error) {
      if (error.response) {
        return res.status(error.response.status).json(error.response.data);
      }
      return res.status(StatusCodes.FORBIDDEN).json({
        status: StatusCodes.FORBIDDEN,
        message: 'You do not have permission to access this endpoint',
      });
    }
  } catch (error) {
    const status = error.status || StatusCodes.INTERNAL_SERVER_ERROR;
    res.status(status).json({
      status,
      message: error.message || 'Internal server error during permission check',
    });
  }
};

module.exports = permissionCheck;