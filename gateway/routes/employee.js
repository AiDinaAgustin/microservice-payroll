const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const multer = require('multer');
const { forwardRequestWithFailover } = require('../utils/requestHandler');

const router = express.Router();
const uploadFile = multer({ storage: multer.memoryStorage() });

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
        details: err?.message || err?.toString() || 'Service unavailable'
      });
    }
  });
};

const handleServiceError = (error, res, serviceName = 'employee') => {
  console.error(`${serviceName} service error:`, error && error.message);
  if (!res.headersSent) {
    let details = 'Service unavailable';
    if (error?.message) {
      details = error.message;
    } else if (typeof error?.toString === 'function') {
      details = error.toString();
    }
    res.status(500).json({
      error: `Error communicating with ${serviceName} service`,
      details
    });
  }
};

const setupEmployeeRoutes = (router, serviceUrl) => {
  router.post('/employees/add', async (req, res) => {
    console.log('🔄 Add employee request received, using failover routing');
    try {
      await forwardRequestWithFailover(serviceUrl, '/v1/employees/add', req, res);
    } catch (error) {
      handleServiceError(error, res);
    }
  });

  router.put('/employees/edit/:id', async (req, res) => {
    console.log('🔄 Edit employee request received, using failover routing');
    try {
      await forwardRequestWithFailover(serviceUrl, `/v1/employees/edit/${req.params.id}`, req, res);
    } catch (error) {
      handleServiceError(error, res);
    }
  });

  router.delete('/employees/delete/:id', async (req, res) => {
    console.log('🔄 Delete employee request received, using failover routing');
    try {
      await forwardRequestWithFailover(serviceUrl, `/v1/employees/delete/${req.params.id}`, req, res);
    } catch (error) {
      handleServiceError(error, res);
    }
  });

  router.get('/employees/detail/:id', async (req, res) => {
    console.log('🔄 Employee detail request received, using failover routing');
    try {
      await forwardRequestWithFailover(serviceUrl, `/v1/employees/detail/${req.params.id}`, req, res);
    } catch (error) {
      handleServiceError(error, res);
    }
  });

  router.get('/employees/list', async (req, res) => {
    console.log('🔄 Employee list request received, using failover routing');
    try {
      await forwardRequestWithFailover(serviceUrl, '/v1/employees/list', req, res);
    } catch (error) {
      handleServiceError(error, res);
    }
  });

  router.get('/employees/options', async (req, res) => {
    console.log('🔄 Employee options request received, using failover routing');
    try {
      await forwardRequestWithFailover(serviceUrl, '/v1/employees/options', req, res);
    } catch (error) {
      handleServiceError(error, res);
    }
  });

  router.patch('/employees/patch/:id', async (req, res) => {
    console.log('🔄 Employee patch request received, using failover routing');
    try {
      await forwardRequestWithFailover(serviceUrl, `/v1/employees/patch/${req.params.id}`, req, res);
    } catch (error) {
      handleServiceError(error, res);
    }
  });

  router.post('/employees/upload', uploadFile.single('file'), async (req, res) => {
    console.log('🔄 Employee upload request received, using failover routing');
    try {
      await forwardRequestWithFailover(serviceUrl, '/v1/employees/upload', req, res);
    } catch (error) {
      handleServiceError(error, res);
    }
  });

  router.get('/employees/download', async (req, res) => {
    console.log('🔄 Employee download request received, using failover routing');
    try {
      await forwardRequestWithFailover(serviceUrl, '/v1/employees/download', req, res, {
        responseType: 'stream'
      });
    } catch (error) {
      handleServiceError(error, res);
    }
  });
};

const setupOrganizationRoutes = (router, serviceUrl) => {
  router.post('/departments/add', async (req, res) => {
    console.log('🔄 Add department request received, using failover routing');
    try {
      await forwardRequestWithFailover(serviceUrl, '/v1/departments/add', req, res);
    } catch (error) {
      handleServiceError(error, res);
    }
  });

  router.put('/departments/edit/:id', async (req, res) => {
    console.log('🔄 Edit department request received, using failover routing');
    try {
      await forwardRequestWithFailover(serviceUrl, `/v1/departments/edit/${req.params.id}`, req, res);
    } catch (error) {
      handleServiceError(error, res);
    }
  });

  router.get('/departments/list', async (req, res) => {
    console.log('🔄 Department list request received, using failover routing');
    try {
      await forwardRequestWithFailover(serviceUrl, '/v1/departments/list', req, res);
    } catch (error) {
      handleServiceError(error, res);
    }
  });

  router.post('/positions/add', async (req, res) => {
    console.log('🔄 Add position request received, using failover routing');
    try {
      await forwardRequestWithFailover(serviceUrl, '/v1/positions/add', req, res);
    } catch (error) {
      handleServiceError(error, res);
    }
  });

  router.put('/positions/edit/:id', async (req, res) => {
    console.log('🔄 Edit position request received, using failover routing');
    try {
      await forwardRequestWithFailover(serviceUrl, `/v1/positions/edit/${req.params.id}`, req, res);
    } catch (error) {
      handleServiceError(error, res);
    }
  });

  router.get('/positions/list', async (req, res) => {
    console.log('🔄 Position list request received, using failover routing');
    try {
      await forwardRequestWithFailover(serviceUrl, '/v1/positions/list', req, res);
    } catch (error) {
      handleServiceError(error, res);
    }
  });

  router.post('/contract-types/add', async (req, res) => {
    console.log('🔄 Add contract type request received, using failover routing');
    try {
      await forwardRequestWithFailover(serviceUrl, '/v1/contract-types/add', req, res);
    } catch (error) {
      handleServiceError(error, res);
    }
  });

  router.put('/contract-types/edit/:id', async (req, res) => {
    console.log('🔄 Edit contract type request received, using failover routing');
    try {
      await forwardRequestWithFailover(serviceUrl, `/v1/contract-types/edit/${req.params.id}`, req, res);
    } catch (error) {
      handleServiceError(error, res);
    }
  });

  router.get('/contract-types/list', async (req, res) => {
    console.log('🔄 Contract type list request received, using failover routing');
    try {
      await forwardRequestWithFailover(serviceUrl, '/v1/contract-types/list', req, res);
    } catch (error) {
      handleServiceError(error, res);
    }
  });

  router.get('/marital-status/list', async (req, res) => {
    console.log('🔄 Marital status list request received, using failover routing');
    try {
      await forwardRequestWithFailover(serviceUrl, '/v1/marital-status/list', req, res);
    } catch (error) {
      handleServiceError(error, res);
    }
  });
};

module.exports = (EMPLOYEE_SERVICE_URL) => {
  const employeeProxy = createEmployeeProxy(EMPLOYEE_SERVICE_URL);

  setupEmployeeRoutes(router, EMPLOYEE_SERVICE_URL);
  setupOrganizationRoutes(router, EMPLOYEE_SERVICE_URL);

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

module.exports.handleServiceError = handleServiceError;