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
    logLevel: 'debug'
  });
  
  // Auth login with direct axios approach
  router.post('/login', async (req, res) => {
    console.log('Login request received, forwarding to auth service');
    forwardRequest(AUTH_SERVICE_URL, '/v1/auth/login', req, res);
  });
  
  // Apply proxy to all other auth routes
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

// green
// const express = require('express');
// const { createProxyMiddleware } = require('http-proxy-middleware');
// const { forwardRequest } = require('../utils/requestHandler');

// const router = express.Router();

// module.exports = (AUTH_SERVICE_URL) => {
//   // Create proxy for auth service
//   const authProxy = createProxyMiddleware({
//     target: AUTH_SERVICE_URL,
//     changeOrigin: true,
//     pathRewrite: null,
//     logLevel: 'debug'
//   });
  
//   // Auth login with direct axios approach
//   router.post('/login', async (req, res) => {
//     console.log('Login request received, forwarding to auth service');
//     forwardRequest(AUTH_SERVICE_URL, '/v1/auth/login', req, res);
//   });
  
//   // Apply proxy to all other auth routes
//   router.use('/', (req, res, next) => {
//     if (req.path === '/login' && req.method === 'POST') {
//       return next('route'); // Skip proxy for login POST
//     }
//     return authProxy(req, res, next);
//   });
  
//   return router;
// };