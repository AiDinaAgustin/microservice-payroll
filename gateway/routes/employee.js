// const express = require('express');
// const { createProxyMiddleware } = require('http-proxy-middleware');
// const multer = require('multer');
// const { forwardRequest } = require('../utils/requestHandler');

// const router = express.Router();
// const uploadFile = multer({ storage: multer.memoryStorage() });

// module.exports = (EMPLOYEE_SERVICE_URL) => {
//   // Create proxy for employee service
//   const employeeProxy = createProxyMiddleware({
//     target: EMPLOYEE_SERVICE_URL,
//     changeOrigin: true,
//     pathRewrite: null,
//     logLevel: 'debug',
//     onError: (err, req, res) => {
//       console.error('Employee proxy error:', err);
//       res.status(500).json({
//         error: 'Error communicating with employee service',
//         details: err.message
//       });
//     }
//   });

//   // Employee routes with direct axios approach
  
//   // Add new employee
//   router.post('/employees/add', (req, res) => {
//     console.log('Add employee request received, forwarding to employee service');
//     forwardRequest(EMPLOYEE_SERVICE_URL, '/v1/employees/add', req, res);
//   });
  
//   // Edit employee
//   router.put('/employees/edit/:id', (req, res) => {
//     forwardRequest(EMPLOYEE_SERVICE_URL, `/v1/employees/edit/${req.params.id}`, req, res);
//   });
  
//   // Delete employee
//   router.delete('/employees/delete/:id', (req, res) => {
//     forwardRequest(EMPLOYEE_SERVICE_URL, `/v1/employees/delete/${req.params.id}`, req, res);
//   });
  
//   // Get employee details
//   router.get('/employees/detail/:id', (req, res) => {
//     forwardRequest(EMPLOYEE_SERVICE_URL, `/v1/employees/detail/${req.params.id}`, req, res);
//   });
  
//   // Get employees list
//   router.get('/employees/list', (req, res) => {
//     console.log('List request received, forwarding to employee service');
//     forwardRequest(EMPLOYEE_SERVICE_URL, '/v1/employees/list', req, res);
//   });
  
//   // Get employee options
//   router.get('/employees/options', (req, res) => {
//     forwardRequest(EMPLOYEE_SERVICE_URL, '/v1/employees/options', req, res);
//   });
  
//   // Patch employee status
//   router.patch('/employees/patch/:id', (req, res) => {
//     forwardRequest(EMPLOYEE_SERVICE_URL, `/v1/employees/patch/${req.params.id}`, req, res);
//   });
  
//   // File upload handler
//   router.post('/employees/upload', uploadFile.single('file'), (req, res) => {
//     console.log('Upload request received, forwarding to employee service');
//     forwardRequest(EMPLOYEE_SERVICE_URL, '/v1/employees/upload', req, res);
//   });
  
//   // Download file
//   router.get('/employees/download', (req, res) => {
//     console.log('Download request received, forwarding to employee service');
//     forwardRequest(EMPLOYEE_SERVICE_URL, '/v1/employees/download', req, res, {
//       responseType: 'stream'
//     });
//   });
  
//   // Add new department
//   router.post('/departments/add', (req, res) => {
//     console.log('Add department request received, forwarding to employee service');
//     forwardRequest(EMPLOYEE_SERVICE_URL, '/v1/departments/add', req, res);
//   });
  
//   // Update department
//   router.put('/departments/edit/:id', (req, res) => {
//     console.log('Edit department request received, forwarding to employee service');
//     forwardRequest(EMPLOYEE_SERVICE_URL, `/v1/departments/edit/${req.params.id}`, req, res);
//   });
  
//   // Add new position
//   router.post('/positions/add', (req, res) => {
//     console.log('Add position request received, forwarding to employee service');
//     forwardRequest(EMPLOYEE_SERVICE_URL, '/v1/positions/add', req, res);
//   });
  
//   // Update position
//   router.put('/positions/edit/:id', (req, res) => {
//     console.log('Edit position request received, forwarding to employee service');
//     forwardRequest(EMPLOYEE_SERVICE_URL, `/v1/positions/edit/${req.params.id}`, req, res);
//   });
  
//   // Add new contract type
//   router.post('/contract-types/add', (req, res) => {
//     console.log('Add contract type request received, forwarding to employee service');
//     forwardRequest(EMPLOYEE_SERVICE_URL, '/v1/contract-types/add', req, res);
//   });
  
//   // Update contract type
//   router.put('/contract-types/edit/:id', (req, res) => {
//     console.log('Edit contract type request received, forwarding to employee service');
//     forwardRequest(EMPLOYEE_SERVICE_URL, `/v1/contract-types/edit/${req.params.id}`, req, res);
//   });
  
//   // Setup proxies for various employee-related endpoints
//   router.use('/employees', employeeProxy);
//   router.use('/marital-status', employeeProxy);
//   router.use('/departments', employeeProxy);
//   router.use('/positions', employeeProxy);
//   router.use('/contract-types', employeeProxy);
//   router.use('/statuses', employeeProxy);
//   router.use('/image', employeeProxy);
//   router.use('/dashboards', employeeProxy);
  
//   return router;
// };

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const multer = require('multer');
const { forwardRequest } = require('../utils/requestHandler');

const router = express.Router();
const uploadFile = multer({ storage: multer.memoryStorage() });

/**
 * Create employee proxy middleware
 */
const createEmployeeProxy = (serviceUrl) => {
  return createProxyMiddleware({
    target: serviceUrl,
    changeOrigin: true,
    pathRewrite: null,
    logLevel: 'debug',
    onError: (err, req, res) => {
      console.error('Employee proxy error:', err);
      res.status(500).json({
        error: 'Error communicating with employee service',
        details: err.message
      });
    }
  });
};

/**
 * Set up employee management routes
 */
const setupEmployeeRoutes = (router, serviceUrl) => {
  // Add new employee
  router.post('/employees/add', (req, res) => {
    console.log('Add employee request received, forwarding to employee service');
    forwardRequest(serviceUrl, '/v1/employees/add', req, res);
  });
  
  // Edit employee
  router.put('/employees/edit/:id', (req, res) => {
    forwardRequest(serviceUrl, `/v1/employees/edit/${req.params.id}`, req, res);
  });
  
  // Delete employee
  router.delete('/employees/delete/:id', (req, res) => {
    forwardRequest(serviceUrl, `/v1/employees/delete/${req.params.id}`, req, res);
  });
  
  // Get employee details
  router.get('/employees/detail/:id', (req, res) => {
    forwardRequest(serviceUrl, `/v1/employees/detail/${req.params.id}`, req, res);
  });
  
  // Get employees list
  router.get('/employees/list', (req, res) => {
    console.log('List request received, forwarding to employee service');
    forwardRequest(serviceUrl, '/v1/employees/list', req, res);
  });
  
  // Get employee options
  router.get('/employees/options', (req, res) => {
    forwardRequest(serviceUrl, '/v1/employees/options', req, res);
  });
  
  // Patch employee status
  router.patch('/employees/patch/:id', (req, res) => {
    forwardRequest(serviceUrl, `/v1/employees/patch/${req.params.id}`, req, res);
  });
  
  // File upload handler
  router.post('/employees/upload', uploadFile.single('file'), (req, res) => {
    console.log('Upload request received, forwarding to employee service');
    forwardRequest(serviceUrl, '/v1/employees/upload', req, res);
  });
  
  // Download file
  router.get('/employees/download', (req, res) => {
    console.log('Download request received, forwarding to employee service');
    forwardRequest(serviceUrl, '/v1/employees/download', req, res, {
      responseType: 'stream'
    });
  });
};

/**
 * Set up organization structure routes
 */
const setupOrganizationRoutes = (router, serviceUrl) => {
  // Add new department
  router.post('/departments/add', (req, res) => {
    console.log('Add department request received, forwarding to employee service');
    forwardRequest(serviceUrl, '/v1/departments/add', req, res);
  });
  
  // Update department
  router.put('/departments/edit/:id', (req, res) => {
    console.log('Edit department request received, forwarding to employee service');
    forwardRequest(serviceUrl, `/v1/departments/edit/${req.params.id}`, req, res);
  });
  
  // Add new position
  router.post('/positions/add', (req, res) => {
    console.log('Add position request received, forwarding to employee service');
    forwardRequest(serviceUrl, '/v1/positions/add', req, res);
  });
  
  // Update position
  router.put('/positions/edit/:id', (req, res) => {
    console.log('Edit position request received, forwarding to employee service');
    forwardRequest(serviceUrl, `/v1/positions/edit/${req.params.id}`, req, res);
  });
  
  // Add new contract type
  router.post('/contract-types/add', (req, res) => {
    console.log('Add contract type request received, forwarding to employee service');
    forwardRequest(serviceUrl, '/v1/contract-types/add', req, res);
  });
  
  // Update contract type
  router.put('/contract-types/edit/:id', (req, res) => {
    console.log('Edit contract type request received, forwarding to employee service');
    forwardRequest(serviceUrl, `/v1/contract-types/edit/${req.params.id}`, req, res);
  });
};

/**
 * Create employee router
 */
module.exports = (EMPLOYEE_SERVICE_URL) => {
  // Create proxy for employee service
  const employeeProxy = createEmployeeProxy(EMPLOYEE_SERVICE_URL);
  
  // Set up specific routes
  setupEmployeeRoutes(router, EMPLOYEE_SERVICE_URL);
  setupOrganizationRoutes(router, EMPLOYEE_SERVICE_URL);
  
  // Setup proxies for various employee-related endpoints
  router.use('/employees', employeeProxy);
  router.use('/marital-status', employeeProxy);
  router.use('/departments', employeeProxy);
  router.use('/positions', employeeProxy);
  router.use('/contract-types', employeeProxy);
  router.use('/statuses', employeeProxy);
  router.use('/image', employeeProxy);
  router.use('/dashboards', employeeProxy);
  
  return router;
};