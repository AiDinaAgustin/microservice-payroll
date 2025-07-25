const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { forwardRequest } = require('../utils/requestHandler');

const router = express.Router();

/**
 * Create payroll proxy middleware
 */
const createPayrollProxy = (serviceUrl) => {
  return createProxyMiddleware({
    target: serviceUrl,
    changeOrigin: true,
    pathRewrite: null,
    logLevel: 'debug',
    onError: (err, req, res) => {
      console.error('Payroll proxy error:', err);
      res.status(500).json({
        error: 'Error communicating with payroll service',
        details: err.message
      });
    }
  });
};

/**
 * ➕ Helper function to handle errors consistently
 */
const handleServiceError = (error, res, serviceName = 'payroll') => {
  console.error(`${serviceName} service error:`, error.message);
  
  if (!res.headersSent) {
    res.status(500).json({
      error: `Error communicating with ${serviceName} service`,
      details: error.message
    });
  }
};

/**
 * Set up salary management routes
 */
const setupSalaryRoutes = (router, serviceUrl) => {
  router.post('/salaries/add', async (req, res) => {
    console.log('Add salary request received, forwarding to payroll service');
    try {
      await forwardRequest(serviceUrl, '/v1/salaries/add', req, res);
    } catch (error) {
      handleServiceError(error, res);
    }
  });
  
  router.get('/salaries/list', async (req, res) => {
    try {
      await forwardRequest(serviceUrl, '/v1/salaries/list', req, res);
    } catch (error) {
      handleServiceError(error, res);
    }
  });
  
  router.get('/salaries/detail/:id', async (req, res) => {
    try {
      await forwardRequest(serviceUrl, `/v1/salaries/detail/${req.params.id}`, req, res);
    } catch (error) {
      handleServiceError(error, res);
    }
  });
  
  router.put('/salaries/edit/:id', async (req, res) => {
    try {
      await forwardRequest(serviceUrl, `/v1/salaries/edit/${req.params.id}`, req, res);
    } catch (error) {
      handleServiceError(error, res);
    }
  });
  
  router.delete('/salaries/delete/:id', async (req, res) => {
    try {
      await forwardRequest(serviceUrl, `/v1/salaries/delete/${req.params.id}`, req, res);
    } catch (error) {
      handleServiceError(error, res);
    }
  });
};

/**
 * Set up attendance management routes
 */
const setupAttendanceRoutes = (router, serviceUrl) => {
  router.post('/attendances/add', async (req, res) => {
    console.log('Add attendance request received, forwarding to payroll service');
    try {
      await forwardRequest(serviceUrl, '/v1/attendances/add', req, res);
    } catch (error) {
      handleServiceError(error, res);
    }
  });
  
  router.get('/attendances/list', async (req, res) => {
    try {
      await forwardRequest(serviceUrl, '/v1/attendances/list', req, res);
    } catch (error) {
      handleServiceError(error, res);
    }
  });
  
  router.get('/attendances/detail/:id', async (req, res) => {
    try {
      await forwardRequest(serviceUrl, `/v1/attendances/detail/${req.params.id}`, req, res);
    } catch (error) {
      handleServiceError(error, res);
    }
  });
  
  router.put('/attendances/edit/:id', async (req, res) => {
    try {
      await forwardRequest(serviceUrl, `/v1/attendances/edit/${req.params.id}`, req, res);
    } catch (error) {
      handleServiceError(error, res);
    }
  });
  
  router.delete('/attendances/delete/:id', async (req, res) => {
    try {
      await forwardRequest(serviceUrl, `/v1/attendances/delete/${req.params.id}`, req, res);
    } catch (error) {
      handleServiceError(error, res);
    }
  });
};

/**
 * Set up attendance deduction routes
 */
const setupAttendanceDeductionRoutes = (router, serviceUrl) => {
  router.post('/attendance-deductions/calculate', async (req, res) => {
    console.log('Calculate deduction request received, forwarding to payroll service');
    try {
      await forwardRequest(serviceUrl, '/v1/attendance-deductions/calculate', req, res);
    } catch (error) {
      handleServiceError(error, res);
    }
  });
  
  router.post('/attendance-deductions/generate', async (req, res) => {
    console.log('Generate deductions request received, forwarding to payroll service');
    try {
      await forwardRequest(serviceUrl, '/v1/attendance-deductions/generate', req, res);
    } catch (error) {
      handleServiceError(error, res);
    }
  });
  
  router.get('/attendance-deductions/list', async (req, res) => {
    console.log('List deductions request received, forwarding to payroll service');
    try {
      await forwardRequest(serviceUrl, '/v1/attendance-deductions/list', req, res);
    } catch (error) {
      handleServiceError(error, res);
    }
  });
  
  router.get('/attendance-deductions/detail/:id', async (req, res) => {
    try {
      await forwardRequest(serviceUrl, `/v1/attendance-deductions/detail/${req.params.id}`, req, res);
    } catch (error) {
      handleServiceError(error, res);
    }
  });
  
  router.delete('/attendance-deductions/delete/:id', async (req, res) => {
    try {
      await forwardRequest(serviceUrl, `/v1/attendance-deductions/delete/${req.params.id}`, req, res);
    } catch (error) {
      handleServiceError(error, res);
    }
  });
};

/**
 * Set up payslip routes
 */
const setupPayslipRoutes = (router, serviceUrl) => {
  router.post('/payslips/add', async (req, res) => {
    console.log('Add payslip request received, forwarding to payroll service');
    try {
      await forwardRequest(serviceUrl, '/v1/payslips/add', req, res);
    } catch (error) {
      handleServiceError(error, res);
    }
  });
  
  router.post('/payslips/generate', async (req, res) => {
    console.log('Generate payslip request received, forwarding to payroll service');
    try {
      await forwardRequest(serviceUrl, '/v1/payslips/generate', req, res);
    } catch (error) {
      handleServiceError(error, res);
    }
  });
  
  router.get('/payslips/list', async (req, res) => {
    console.log('List payslips request received, forwarding to payroll service');
    try {
      await forwardRequest(serviceUrl, '/v1/payslips/list', req, res);
    } catch (error) {
      handleServiceError(error, res);
    }
  });
  
  router.get('/payslips/detail/:id', async (req, res) => {
    try {
      await forwardRequest(serviceUrl, `/v1/payslips/detail/${req.params.id}`, req, res);
    } catch (error) {
      handleServiceError(error, res);
    }
  });
};

/**
 * Create payroll router
 */
module.exports = (PAYROLL_SERVICE_URL) => {
  // Create proxy for payroll service
  const payrollProxy = createPayrollProxy(PAYROLL_SERVICE_URL);
  
  // Set up specific routes by category
  setupSalaryRoutes(router, PAYROLL_SERVICE_URL);
  setupAttendanceRoutes(router, PAYROLL_SERVICE_URL);
  setupAttendanceDeductionRoutes(router, PAYROLL_SERVICE_URL);
  setupPayslipRoutes(router, PAYROLL_SERVICE_URL);
  
  // Setup proxies for various payroll-related endpoints
  router.use('/salaries', payrollProxy);
  router.use('/attendances', payrollProxy);
  router.use('/attendance-deductions', payrollProxy);
  router.use('/payslips', payrollProxy);
  router.use('/payroll', payrollProxy);
  
  return router;
};

module.exports.handleServiceError = handleServiceError;