const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { forwardRequest } = require('../utils/requestHandler');

const router = express.Router();

module.exports = (AUTH_SERVICE_URL) => {
  // Create proxy for auth service
  const authProxy = createProxyMiddleware({
    target: AUTH_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: null,
    logLevel: 'debug',
        onError: (err, req, res) => {
      console.error('Auth proxy error:', err);
      let details = 'Service unavailable';
      if (err?.message) {
        details = err.message;
      } else if (typeof err?.toString === 'function') {
        details = err.toString();
      }
      res.status(500).json({
        error: 'Error communicating with auth service',
        details
      });
    }
  });
  
  // ➕ Auth login with proper error handling
  router.post('/login', async (req, res) => {
    console.log('Login request received, forwarding to auth service');
    
    try {
      await forwardRequest(AUTH_SERVICE_URL, '/v1/auth/login', req, res);
    } catch (error) {
      console.error('Login forwarding error:', error.message);
      
      // ➕ Check if response was already sent
      if (!res.headersSent) {
        res.status(500).json({
          error: 'Error communicating with auth service',
          details: error.message
        });
      }
    }
  });
  
  // Apply proxy to all other auth routes
  router.use('/', (req, res, next) => {
    // Handling edge cases - undefined path or method
    if (!req.path || !req.method) {
      return authProxy(req, res, next);
    }
    
    // Pisahkan kondisi untuk meningkatkan testability
    const isLoginPath = req.path === '/login';
    const isPostMethod = req.method === 'POST';
    
    // Test kondisi secara terpisah
    if (isLoginPath && isPostMethod) {
      return next('route'); // Skip proxy for login POST
    }
    
    // Default case
    return authProxy(req, res, next);
  });
  
  return router;
};