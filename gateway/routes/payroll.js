// GREEN
// const express = require('express');
// const { createProxyMiddleware } = require('http-proxy-middleware');
// const { forwardRequest } = require('../utils/requestHandler');

// const router = express.Router();

// module.exports = (PAYROLL_SERVICE_URL) => {
//   // Create proxy for payroll service
//   const payrollProxy = createProxyMiddleware({
//     target: PAYROLL_SERVICE_URL,
//     changeOrigin: true,
//     pathRewrite: null,
//     logLevel: 'debug',
//     onError: (err, req, res) => {
//       console.error('Payroll proxy error:', err);
//       res.status(500).json({
//         error: 'Error communicating with payroll service',
//         details: err.message
//       });
//     }
//   });
  
//   // Salary routes
//   router.post('/salaries/add', (req, res) => {
//     console.log('Add salary request received, forwarding to payroll service');
//     console.log('Request body:', JSON.stringify(req.body, null, 2));
//     console.log('Headers:', JSON.stringify(req.headers, null, 2));
//     forwardRequest(PAYROLL_SERVICE_URL, '/v1/salaries/add', req, res);
//   });
  
//   router.get('/salaries/list', (req, res) => {
//     forwardRequest(PAYROLL_SERVICE_URL, '/v1/salaries/list', req, res);
//   });
  
//   router.get('/salaries/detail/:id', (req, res) => {
//     forwardRequest(PAYROLL_SERVICE_URL, `/v1/salaries/detail/${req.params.id}`, req, res);
//   });
  
//   router.put('/salaries/edit/:id', (req, res) => {
//     forwardRequest(PAYROLL_SERVICE_URL, `/v1/salaries/edit/${req.params.id}`, req, res);
//   });
  
//   router.delete('/salaries/delete/:id', (req, res) => {
//     forwardRequest(PAYROLL_SERVICE_URL, `/v1/salaries/delete/${req.params.id}`, req, res);
//   });
  
//   // Attendance routes
//   router.post('/attendances/add', (req, res) => {
//     console.log('Add attendance request received, forwarding to payroll service');
//     console.log('Request body:', JSON.stringify(req.body, null, 2));
//     console.log('Headers:', JSON.stringify(req.headers, null, 2));
//     forwardRequest(PAYROLL_SERVICE_URL, '/v1/attendances/add', req, res);
//   });
  
//   router.get('/attendances/list', (req, res) => {
//     forwardRequest(PAYROLL_SERVICE_URL, '/v1/attendances/list', req, res);
//   });
  
//   router.get('/attendances/detail/:id', (req, res) => {
//     forwardRequest(PAYROLL_SERVICE_URL, `/v1/attendances/detail/${req.params.id}`, req, res);
//   });
  
//   router.put('/attendances/edit/:id', (req, res) => {
//     forwardRequest(PAYROLL_SERVICE_URL, `/v1/attendances/edit/${req.params.id}`, req, res);
//   });
  
//   router.delete('/attendances/delete/:id', (req, res) => {
//     forwardRequest(PAYROLL_SERVICE_URL, `/v1/attendances/delete/${req.params.id}`, req, res);
//   });
  
//   // Attendance Deduction routes
//   router.post('/attendance-deductions/calculate', (req, res) => {
//     console.log('Calculate deduction request received, forwarding to payroll service');
//     forwardRequest(PAYROLL_SERVICE_URL, '/v1/attendance-deductions/calculate', req, res);
//   });
  
//   router.post('/attendance-deductions/generate', (req, res) => {
//     console.log('Generate deductions request received, forwarding to payroll service');
//     forwardRequest(PAYROLL_SERVICE_URL, '/v1/attendance-deductions/generate', req, res);
//   });
  
//   router.get('/attendance-deductions/list', (req, res) => {
//     console.log('List deductions request received, forwarding to payroll service');
//     forwardRequest(PAYROLL_SERVICE_URL, '/v1/attendance-deductions/list', req, res);
//   });
  
//   router.get('/attendance-deductions/detail/:id', (req, res) => {
//     forwardRequest(PAYROLL_SERVICE_URL, `/v1/attendance-deductions/detail/${req.params.id}`, req, res);
//   });
  
//   router.delete('/attendance-deductions/delete/:id', (req, res) => {
//     forwardRequest(PAYROLL_SERVICE_URL, `/v1/attendance-deductions/delete/${req.params.id}`, req, res);
//   });
  
//   // Payslip routes
//   router.post('/payslips/add', (req, res) => {
//     console.log('Add payslip request received, forwarding to payroll service');
//     forwardRequest(PAYROLL_SERVICE_URL, '/v1/payslips/add', req, res);
//   });
  
//   router.post('/payslips/generate', (req, res) => {
//     console.log('Generate payslip request received, forwarding to payroll service');
//     forwardRequest(PAYROLL_SERVICE_URL, '/v1/payslips/generate', req, res);
//   });
  
//   router.get('/payslips/list', (req, res) => {
//     console.log('List payslips request received, forwarding to payroll service');
//     forwardRequest(PAYROLL_SERVICE_URL, '/v1/payslips/list', req, res);
//   });
  
//   router.get('/payslips/detail/:id', (req, res) => {
//     forwardRequest(PAYROLL_SERVICE_URL, `/v1/payslips/detail/${req.params.id}`, req, res);
//   });
  
//   // Setup proxies for various payroll-related endpoints
//   router.use('/salaries', payrollProxy);
//   router.use('/attendances', payrollProxy);
//   router.use('/attendance-deductions', payrollProxy);
//   router.use('/payslips', payrollProxy);
//   router.use('/payroll', payrollProxy);
  
//   return router;
// };

// REFACTOR
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
 * Set up salary management routes
 */
const setupSalaryRoutes = (router, serviceUrl) => {
  router.post('/salaries/add', (req, res) => {
    console.log('Add salary request received, forwarding to payroll service');
    forwardRequest(serviceUrl, '/v1/salaries/add', req, res);
  });
  
  router.get('/salaries/list', (req, res) => {
    forwardRequest(serviceUrl, '/v1/salaries/list', req, res);
  });
  
  router.get('/salaries/detail/:id', (req, res) => {
    forwardRequest(serviceUrl, `/v1/salaries/detail/${req.params.id}`, req, res);
  });
  
  router.put('/salaries/edit/:id', (req, res) => {
    forwardRequest(serviceUrl, `/v1/salaries/edit/${req.params.id}`, req, res);
  });
  
  router.delete('/salaries/delete/:id', (req, res) => {
    forwardRequest(serviceUrl, `/v1/salaries/delete/${req.params.id}`, req, res);
  });
};

/**
 * Set up attendance management routes
 */
const setupAttendanceRoutes = (router, serviceUrl) => {
  router.post('/attendances/add', (req, res) => {
    console.log('Add attendance request received, forwarding to payroll service');
    forwardRequest(serviceUrl, '/v1/attendances/add', req, res);
  });
  
  router.get('/attendances/list', (req, res) => {
    forwardRequest(serviceUrl, '/v1/attendances/list', req, res);
  });
  
  router.get('/attendances/detail/:id', (req, res) => {
    forwardRequest(serviceUrl, `/v1/attendances/detail/${req.params.id}`, req, res);
  });
  
  router.put('/attendances/edit/:id', (req, res) => {
    forwardRequest(serviceUrl, `/v1/attendances/edit/${req.params.id}`, req, res);
  });
  
  router.delete('/attendances/delete/:id', (req, res) => {
    forwardRequest(serviceUrl, `/v1/attendances/delete/${req.params.id}`, req, res);
  });
};

/**
 * Set up attendance deduction routes
 */
const setupAttendanceDeductionRoutes = (router, serviceUrl) => {
  router.post('/attendance-deductions/calculate', (req, res) => {
    console.log('Calculate deduction request received, forwarding to payroll service');
    forwardRequest(serviceUrl, '/v1/attendance-deductions/calculate', req, res);
  });
  
  router.post('/attendance-deductions/generate', (req, res) => {
    console.log('Generate deductions request received, forwarding to payroll service');
    forwardRequest(serviceUrl, '/v1/attendance-deductions/generate', req, res);
  });
  
  router.get('/attendance-deductions/list', (req, res) => {
    console.log('List deductions request received, forwarding to payroll service');
    forwardRequest(serviceUrl, '/v1/attendance-deductions/list', req, res);
  });
  
  router.get('/attendance-deductions/detail/:id', (req, res) => {
    forwardRequest(serviceUrl, `/v1/attendance-deductions/detail/${req.params.id}`, req, res);
  });
  
  router.delete('/attendance-deductions/delete/:id', (req, res) => {
    forwardRequest(serviceUrl, `/v1/attendance-deductions/delete/${req.params.id}`, req, res);
  });
};

/**
 * Set up payslip routes
 */
const setupPayslipRoutes = (router, serviceUrl) => {
  router.post('/payslips/add', (req, res) => {
    console.log('Add payslip request received, forwarding to payroll service');
    forwardRequest(serviceUrl, '/v1/payslips/add', req, res);
  });
  
  router.post('/payslips/generate', (req, res) => {
    console.log('Generate payslip request received, forwarding to payroll service');
    forwardRequest(serviceUrl, '/v1/payslips/generate', req, res);
  });
  
  router.get('/payslips/list', (req, res) => {
    console.log('List payslips request received, forwarding to payroll service');
    forwardRequest(serviceUrl, '/v1/payslips/list', req, res);
  });
  
  router.get('/payslips/detail/:id', (req, res) => {
    forwardRequest(serviceUrl, `/v1/payslips/detail/${req.params.id}`, req, res);
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