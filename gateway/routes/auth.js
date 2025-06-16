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
  router.use('/', (req, res, next) => {
    if (req.path === '/login' && req.method === 'POST') {
      return next('route'); // Skip proxy for login POST
    }
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