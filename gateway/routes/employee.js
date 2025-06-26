// GREEN
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

// REFACTOR
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const multer = require('multer');
const { forwardRequestWithFailover } = require('../utils/requestHandler'); // ➕ Change to failover version

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
 * Set up employee management routes with failover
 */
const setupEmployeeRoutes = (router, serviceUrl) => {
  // ➕ All routes now use forwardRequestWithFailover
  router.post('/employees/add', (req, res) => {
    console.log('🔄 Add employee request received, using failover routing');
    forwardRequestWithFailover(serviceUrl, '/v1/employees/add', req, res);
  });
  
  router.put('/employees/edit/:id', (req, res) => {
    console.log('🔄 Edit employee request received, using failover routing');
    forwardRequestWithFailover(serviceUrl, `/v1/employees/edit/${req.params.id}`, req, res);
  });
  
  router.delete('/employees/delete/:id', (req, res) => {
    console.log('🔄 Delete employee request received, using failover routing');
    forwardRequestWithFailover(serviceUrl, `/v1/employees/delete/${req.params.id}`, req, res);
  });
  
  router.get('/employees/detail/:id', (req, res) => {
    console.log('🔄 Employee detail request received, using failover routing');
    forwardRequestWithFailover(serviceUrl, `/v1/employees/detail/${req.params.id}`, req, res);
  });
  
  router.get('/employees/list', (req, res) => {
    console.log('🔄 Employee list request received, using failover routing');
    forwardRequestWithFailover(serviceUrl, '/v1/employees/list', req, res);
  });
  
  router.get('/employees/options', (req, res) => {
    console.log('🔄 Employee options request received, using failover routing');
    forwardRequestWithFailover(serviceUrl, '/v1/employees/options', req, res);
  });
  
  router.patch('/employees/patch/:id', (req, res) => {
    console.log('🔄 Employee patch request received, using failover routing');
    forwardRequestWithFailover(serviceUrl, `/v1/employees/patch/${req.params.id}`, req, res);
  });
  
  // File upload handler with failover
  router.post('/employees/upload', uploadFile.single('file'), (req, res) => {
    console.log('🔄 Employee upload request received, using failover routing');
    forwardRequestWithFailover(serviceUrl, '/v1/employees/upload', req, res);
  });
  
  // Download file with failover
  router.get('/employees/download', (req, res) => {
    console.log('🔄 Employee download request received, using failover routing');
    forwardRequestWithFailover(serviceUrl, '/v1/employees/download', req, res, {
      responseType: 'stream'
    });
  });
};

/**
 * Set up organization structure routes with failover
 */
const setupOrganizationRoutes = (router, serviceUrl) => {
  router.post('/departments/add', (req, res) => {
    console.log('🔄 Add department request received, using failover routing');
    forwardRequestWithFailover(serviceUrl, '/v1/departments/add', req, res);
  });
  
  router.put('/departments/edit/:id', (req, res) => {
    console.log('🔄 Edit department request received, using failover routing');
    forwardRequestWithFailover(serviceUrl, `/v1/departments/edit/${req.params.id}`, req, res);
  });
  
  router.get('/departments/list', (req, res) => {
    console.log('🔄 Department list request received, using failover routing');
    forwardRequestWithFailover(serviceUrl, '/v1/departments/list', req, res);
  });
  
  router.post('/positions/add', (req, res) => {
    console.log('🔄 Add position request received, using failover routing');
    forwardRequestWithFailover(serviceUrl, '/v1/positions/add', req, res);
  });
  
  router.put('/positions/edit/:id', (req, res) => {
    console.log('🔄 Edit position request received, using failover routing');
    forwardRequestWithFailover(serviceUrl, `/v1/positions/edit/${req.params.id}`, req, res);
  });
  
  router.get('/positions/list', (req, res) => {
    console.log('🔄 Position list request received, using failover routing');
    forwardRequestWithFailover(serviceUrl, '/v1/positions/list', req, res);
  });
  
  router.post('/contract-types/add', (req, res) => {
    console.log('🔄 Add contract type request received, using failover routing');
    forwardRequestWithFailover(serviceUrl, '/v1/contract-types/add', req, res);
  });
  
  router.put('/contract-types/edit/:id', (req, res) => {
    console.log('🔄 Edit contract type request received, using failover routing');
    forwardRequestWithFailover(serviceUrl, `/v1/contract-types/edit/${req.params.id}`, req, res);
  });
  
  router.get('/contract-types/list', (req, res) => {
    console.log('🔄 Contract type list request received, using failover routing');
    forwardRequestWithFailover(serviceUrl, '/v1/contract-types/list', req, res);
  });
  
  router.get('/marital-status/list', (req, res) => {
    console.log('🔄 Marital status list request received, using failover routing');
    forwardRequestWithFailover(serviceUrl, '/v1/marital-status/list', req, res);
  });
};

/**
 * Create employee router with failover support
 */
module.exports = (EMPLOYEE_SERVICE_URL) => {
  // Create proxy for employee service (fallback for non-specific routes)
  const employeeProxy = createEmployeeProxy(EMPLOYEE_SERVICE_URL);
  
  // Set up specific routes with failover
  setupEmployeeRoutes(router, EMPLOYEE_SERVICE_URL);
  setupOrganizationRoutes(router, EMPLOYEE_SERVICE_URL);
  
  // Setup proxies for various employee-related endpoints (as fallback)
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