const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const dotenv = require('dotenv');
const axios = require('axios');
const multer = require('multer');
const FormData = require('form-data');
const uploadFile = multer({ storage: multer.memoryStorage() });

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Service configurations
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:5001';
const EMPLOYEE_SERVICE_URL = process.env.EMPLOYEE_SERVICE_URL || 'http://localhost:5002';
const PAYROLL_SERVICE_URL = process.env.PAYROLL_SERVICE_URL || 'http://localhost:5003';

console.log('Using AUTH_SERVICE_URL:', AUTH_SERVICE_URL);
console.log('Using EMPLOYEE_SERVICE_URL:', EMPLOYEE_SERVICE_URL);
console.log('Using PAYROLL_SERVICE_URL:', PAYROLL_SERVICE_URL);

// Auth login with direct axios approach
app.post('/v1/auth/login', async (req, res) => {
  console.log('Login request received, forwarding to auth service');
  try {
    const response = await axios.post(`${AUTH_SERVICE_URL}/v1/auth/login`, req.body);
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error forwarding login request:', error.message);
    res.status(500).json({
      error: 'Error communicating with auth service',
      details: error.message
    });
  }
});

// Proxy middleware configurations
const authProxy = createProxyMiddleware({
  target: AUTH_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: null,
  logLevel: 'debug'
});

const employeeProxy = createProxyMiddleware({
  target: EMPLOYEE_SERVICE_URL,
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

const payrollProxy = createProxyMiddleware({
  target: PAYROLL_SERVICE_URL,
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


// Apply proxy to auth routes
app.use('/v1/auth', (req, res, next) => {
  if (req.path === '/login' && req.method === 'POST') {
    return next('route'); // Skip proxy for login POST
  }
  return authProxy(req, res, next);
});

// Add new contract type
app.post('/v1/contract-types/add', async (req, res) => {
  console.log('Add contract type request received, forwarding to employee service');
  try {
    const response = await axios.post(`${EMPLOYEE_SERVICE_URL}/v1/contract-types/add`, req.body, {
      headers: req.headers
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error forwarding contract type add request:', error.message);
    res.status(500).json({
      error: 'Error communicating with employee service',
      details: error.message
    });
  }
});

// Update contract type
app.put('/v1/contract-types/edit/:id', async (req, res) => {
  console.log('Edit contract type request received, forwarding to employee service');
  try {
    const response = await axios.put(
      `${EMPLOYEE_SERVICE_URL}/v1/contract-types/edit/${req.params.id}`, 
      req.body,
      { headers: req.headers }
    );
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error forwarding contract type edit request:', error.message);
    res.status(500).json({
      error: 'Error communicating with employee service',
      details: error.message
    });
  }
});

// Add new department
app.post('/v1/departments/add', async (req, res) => {
  console.log('Add department request received, forwarding to employee service');
  try {
    const response = await axios.post(`${EMPLOYEE_SERVICE_URL}/v1/departments/add`, req.body, {
      headers: req.headers
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error forwarding department add request:', error.message);
    res.status(500).json({
      error: 'Error communicating with employee service',
      details: error.message
    });
  }
});

// Update department
app.put('/v1/departments/edit/:id', async (req, res) => {
  console.log('Edit department request received, forwarding to employee service');
  try {
    const response = await axios.put(
      `${EMPLOYEE_SERVICE_URL}/v1/departments/edit/${req.params.id}`, 
      req.body,
      { headers: req.headers }
    );
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error forwarding department edit request:', error.message);
    res.status(500).json({
      error: 'Error communicating with employee service',
      details: error.message
    });
  }
});

// Add new position
app.post('/v1/positions/add', async (req, res) => {
  console.log('Add position request received, forwarding to employee service');
  try {
    const response = await axios.post(`${EMPLOYEE_SERVICE_URL}/v1/positions/add`, req.body, {
      headers: req.headers
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error forwarding position add request:', error.message);
    res.status(500).json({
      error: 'Error communicating with employee service',
      details: error.message
    });
  }
});

// Update position
app.put('/v1/positions/edit/:id', async (req, res) => {
  console.log('Edit position request received, forwarding to employee service');
  try {
    const response = await axios.put(
      `${EMPLOYEE_SERVICE_URL}/v1/positions/edit/${req.params.id}`, 
      req.body,
      { headers: req.headers }
    );
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error forwarding position edit request:', error.message);
    res.status(500).json({
      error: 'Error communicating with employee service',
      details: error.message
    });
  }
});

// Patch employee status
app.patch('/v1/employees/patch/:id', async (req, res) => {
  try {
    const response = await axios.patch(
      `${EMPLOYEE_SERVICE_URL}/v1/employees/patch/${req.params.id}`,
      req.body,
      { headers: req.headers }
    );
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(500).json({
      error: 'Error communicating with employee service',
      details: error.message
    });
  }
});

// Add new employee
app.post('/v1/employees/add', async (req, res) => {
  console.log('Add employee request received, forwarding to employee service');
  try {
    const response = await axios.post(`${EMPLOYEE_SERVICE_URL}/v1/employees/add`, req.body, {
      headers: req.headers
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error forwarding add request:', error.message);
    res.status(500).json({
      error: 'Error communicating with employee service',
      details: error.message
    });
  }
});

// Edit employee
app.put('/v1/employees/edit/:id', async (req, res) => {
  try {
    const response = await axios.put(
      `${EMPLOYEE_SERVICE_URL}/v1/employees/edit/${req.params.id}`,
      req.body,
      { headers: req.headers }
    );
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(500).json({
      error: 'Error communicating with employee service',
      details: error.message
    });
  }
});

// Apply proxy to all employee service routes
app.use('/v1/employees', employeeProxy);
app.use('/v1/marital-status', employeeProxy);
app.use('/v1/departments', employeeProxy);
app.use('/v1/positions', employeeProxy);
app.use('/v1/contract-types', employeeProxy);
app.use('/v1/statuses', employeeProxy);
app.use('/v1/image', employeeProxy);
app.use('/v1/dashboards', employeeProxy);

// Employee routes with direct axios approach
app.post('/v1/employees/upload', uploadFile.single('file'), async (req, res) => {
  console.log('Upload request received, forwarding to employee service');
  try {
    const formData = new FormData();
    formData.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    const response = await axios.post(`${EMPLOYEE_SERVICE_URL}/v1/employees/upload`, formData, {
      headers: {
        ...req.headers,
        'Content-Type': 'multipart/form-data'
      }
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error forwarding upload request:', error.message);
    res.status(500).json({
      error: 'Error communicating with employee service',
      details: error.message
    });
  }
});

// Download file
app.get('/v1/employees/download', async (req, res) => {
  console.log('Download request received, forwarding to employee service');
  try {
    const response = await axios.get(`${EMPLOYEE_SERVICE_URL}/v1/employees/download`, {
      responseType: 'stream',
      params: req.query,
      headers: req.headers
    });

    res.setHeader('Content-Type', response.headers['content-type']);
    res.setHeader('Content-Disposition', response.headers['content-disposition']);
    response.data.pipe(res);
  } catch (error) {
    console.error('Error forwarding download request:', error.message);
    res.status(500).json({
      error: 'Error communicating with employee service',
      details: error.message
    });
  }
});

// Get employees list
app.get('/v1/employees/list', async (req, res) => {
  console.log('List request received, forwarding to employee service');
  try {
    const response = await axios.get(`${EMPLOYEE_SERVICE_URL}/v1/employees/list`, {
      params: req.query,
      headers: req.headers
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error forwarding list request:', error.message);
    res.status(500).json({
      error: 'Error communicating with employee service',
      details: error.message
    });
  }
});

// Get employee options
app.get('/v1/employees/options', async (req, res) => {
  try {
    const response = await axios.get(`${EMPLOYEE_SERVICE_URL}/v1/employees/options`, {
      params: req.query,
      headers: req.headers
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(500).json({
      error: 'Error communicating with employee service',
      details: error.message
    });
  }
});

// Get employee details
app.get('/v1/employees/detail/:id', async (req, res) => {
  try {
    const response = await axios.get(`${EMPLOYEE_SERVICE_URL}/v1/employees/detail/${req.params.id}`, {
      headers: req.headers
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(500).json({
      error: 'Error communicating with employee service',
      details: error.message
    });
  }
});

// Patch employee status
app.patch('/v1/employees/patch/:id', async (req, res) => {
  try {
    const response = await axios.patch(
      `${EMPLOYEE_SERVICE_URL}/v1/employees/patch/${req.params.id}`,
      req.body,
      { headers: req.headers }
    );
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(500).json({
      error: 'Error communicating with employee service',
      details: error.message
    });
  }
});

// Add new employee
app.post('/v1/employees/add', async (req, res) => {
  console.log('Add employee request received, forwarding to employee service');
  try {
    const response = await axios.post(`${EMPLOYEE_SERVICE_URL}/v1/employees/add`, req.body, {
      headers: req.headers
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error forwarding add request:', error.message);
    res.status(500).json({
      error: 'Error communicating with employee service',
      details: error.message
    });
  }
});

// Edit employee
app.put('/v1/employees/edit/:id', async (req, res) => {
  try {
    const response = await axios.put(
      `${EMPLOYEE_SERVICE_URL}/v1/employees/edit/${req.params.id}`,
      req.body,
      { headers: req.headers }
    );
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(500).json({
      error: 'Error communicating with employee service',
      details: error.message
    });
  }
});

// Delete employee
app.delete('/v1/employees/delete/:id', async (req, res) => {
  try {
    const response = await axios.delete(`${EMPLOYEE_SERVICE_URL}/v1/employees/delete/${req.params.id}`, {
      headers: req.headers
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(500).json({
      error: 'Error communicating with employee service',
      details: error.message
    });
  }
});

// Salary routes
app.post('/v1/salaries/add', async (req, res) => {
  console.log('Add salary request received, forwarding to payroll service');
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  
  try {
    const response = await axios.post(`${PAYROLL_SERVICE_URL}/v1/salaries/add`, req.body, {
      headers: req.headers
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error forwarding salary add request:', error.message);
    
    // Log the detailed error response
    if (error.response) {
      console.error('Error response data:', JSON.stringify(error.response.data, null, 2));
      console.error('Error response status:', error.response.status);
      // Forward the actual error response instead of a generic 500
      return res.status(error.response.status).json(error.response.data);
    }
    
    res.status(500).json({
      error: 'Error communicating with payroll service',
      details: error.message
    });
  }
});

// Update the salaries list endpoint to handle 304 responses properly
app.get('/v1/salaries/list', async (req, res) => {
  try {
    const response = await axios.get(`${PAYROLL_SERVICE_URL}/v1/salaries/list`, {
      params: req.query,
      headers: req.headers,
      // Tell axios not to throw an error for 304 status
      validateStatus: function (status) {
        return (status >= 200 && status < 300) || status === 304;
      }
    });
    
    // Forward the same status code and response
    res.status(response.status);
    
    // If we have data, send it, otherwise send an empty response for 304
    if (response.data) {
      res.json(response.data);
    } else if (response.status === 304) {
      res.end(); // Send an empty response for 304
    }
  } catch (error) {
    
    // If the error has a response, return that status and data
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    
    // Otherwise return a generic 500 error
    res.status(500).json({
      error: 'Error communicating with payroll service',
      details: error.message
    });
  }
});

app.get('/v1/salaries/detail/:id', async (req, res) => {
  try {
    const response = await axios.get(`${PAYROLL_SERVICE_URL}/v1/salaries/detail/${req.params.id}`, {
      headers: req.headers
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(500).json({
      error: 'Error communicating with payroll service',
      details: error.message
    });
  }
});

app.put('/v1/salaries/edit/:id', async (req, res) => {
  try {
    const response = await axios.put(
      `${PAYROLL_SERVICE_URL}/v1/salaries/edit/${req.params.id}`,
      req.body,
      { headers: req.headers }
    );
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(500).json({
      error: 'Error communicating with payroll service',
      details: error.message
    });
  }
});

app.delete('/v1/salaries/delete/:id', async (req, res) => {
  try {
    const response = await axios.delete(`${PAYROLL_SERVICE_URL}/v1/salaries/delete/${req.params.id}`, {
      headers: req.headers
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(500).json({
      error: 'Error communicating with payroll service',
      details: error.message
    });
  }
});

// Attendance routes
app.post('/v1/attendances/add', async (req, res) => {
  console.log('Add attendance request received, forwarding to payroll service');
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  
  try {
    const response = await axios.post(`${PAYROLL_SERVICE_URL}/v1/attendances/add`, req.body, {
      headers: req.headers
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error forwarding attendance add request:', error.message);
    
    // Log the detailed error response
    if (error.response) {
      console.error('Error response data:', JSON.stringify(error.response.data, null, 2));
      console.error('Error response status:', error.response.status);
      // Forward the actual error response instead of a generic 500
      return res.status(error.response.status).json(error.response.data);
    }
    
    res.status(500).json({
      error: 'Error communicating with payroll service',
      details: error.message
    });
  }
});

app.get('/v1/attendances/list', async (req, res) => {
  try {
    const response = await axios.get(`${PAYROLL_SERVICE_URL}/v1/attendances/list`, {
      params: req.query,
      headers: req.headers,
      // Tell axios not to throw an error for 304 status
      validateStatus: function (status) {
        return (status >= 200 && status < 300) || status === 304;
      }
    });
    
    // Forward the same status code and response
    res.status(response.status);
    
    // If we have data, send it, otherwise send an empty response for 304
    if (response.data) {
      res.json(response.data);
    } else if (response.status === 304) {
      res.end(); // Send an empty response for 304
    }
  } catch (error) {
    
    // If the error has a response, return that status and data
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    
    // Otherwise return a generic 500 error
    res.status(500).json({
      error: 'Error communicating with payroll service',
      details: error.message
    });
  }
});

app.get('/v1/attendances/detail/:id', async (req, res) => {
  try {
    const response = await axios.get(`${PAYROLL_SERVICE_URL}/v1/attendances/detail/${req.params.id}`, {
      headers: req.headers
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(500).json({
      error: 'Error communicating with payroll service',
      details: error.message
    });
  }
});

app.put('/v1/attendances/edit/:id', async (req, res) => {
  try {
    const response = await axios.put(
      `${PAYROLL_SERVICE_URL}/v1/attendances/edit/${req.params.id}`,
      req.body,
      { headers: req.headers }
    );
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(500).json({
      error: 'Error communicating with payroll service',
      details: error.message
    });
  }
});

app.delete('/v1/attendances/delete/:id', async (req, res) => {
  try {
    const response = await axios.delete(`${PAYROLL_SERVICE_URL}/v1/attendances/delete/${req.params.id}`, {
      headers: req.headers
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(500).json({
      error: 'Error communicating with payroll service',
      details: error.message
    });
  }
});

// Attendance Deduction routes
app.post('/v1/attendance-deductions/calculate', async (req, res) => {
  console.log('Calculate deduction request received, forwarding to payroll service');
  try {
    const response = await axios.post(`${PAYROLL_SERVICE_URL}/v1/attendance-deductions/calculate`, req.body, {
      headers: req.headers
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error forwarding deduction calculate request:', error.message);
    res.status(500).json({
      error: 'Error communicating with payroll service',
      details: error.message
    });
  }
});

app.post('/v1/attendance-deductions/generate', async (req, res) => {
  console.log('Generate deductions request received, forwarding to payroll service');
  try {
    const response = await axios.post(
      `${PAYROLL_SERVICE_URL}/v1/attendance-deductions/generate`, 
      req.body, 
      {
        headers: req.headers,
        validateStatus: function (status) {
          return (status >= 200 && status < 300) || status === 304;
        }
      }
    );
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error forwarding generate deductions request:', error.message);
    
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    
    res.status(500).json({
      error: 'Error communicating with payroll service',
      details: error.message
    });
  }
});

app.get('/v1/attendance-deductions/list', async (req, res) => {
  console.log('List deductions request received, forwarding to payroll service');
  try {
    const response = await axios.get(`${PAYROLL_SERVICE_URL}/v1/attendance-deductions/list`, {
      params: req.query,
      headers: req.headers
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error forwarding deductions list request:', error.message);
    res.status(500).json({
      error: 'Error communicating with payroll service',
      details: error.message
    });
  }
});

app.get('/v1/attendance-deductions/detail/:id', async (req, res) => {
  try {
    const response = await axios.get(`${PAYROLL_SERVICE_URL}/v1/attendance-deductions/detail/${req.params.id}`, {
      headers: req.headers
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(500).json({
      error: 'Error communicating with payroll service',
      details: error.message
    });
  }
});

app.delete('/v1/attendance-deductions/delete/:id', async (req, res) => {
  try {
    const response = await axios.delete(`${PAYROLL_SERVICE_URL}/v1/attendance-deductions/delete/${req.params.id}`, {
      headers: req.headers
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(500).json({
      error: 'Error communicating with payroll service',
      details: error.message
    });
  }
});

app.post('/v1/payslips/generate', async (req, res) => {
  console.log('Generate payslip request received, forwarding to payroll service');
  try {
    const response = await axios.post(
      `${PAYROLL_SERVICE_URL}/v1/payslips/generate`, 
      req.body, 
      {
        headers: req.headers,
        validateStatus: function (status) {
          return (status >= 200 && status < 300) || status === 304;
        }
      }
    );
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error forwarding generate payslip request:', error.message);
    
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    
    res.status(500).json({
      error: 'Error communicating with payroll service',
      details: error.message
    });
  }
});
// Payslip routes
app.post('/v1/payslips/add', async (req, res) => {
  console.log('Add payslip request received, forwarding to payroll service');
  try {
    const response = await axios.post(`${PAYROLL_SERVICE_URL}/v1/payslips/add`, req.body, {
      headers: req.headers
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error forwarding payslip add request:', error.message);
    res.status(500).json({
      error: 'Error communicating with payroll service',
      details: error.message
    });
  }
});

// Update the payslips list endpoint to handle 304 responses properly
app.get('/v1/payslips/list', async (req, res) => {
  console.log('List payslips request received, forwarding to payroll service');
  try {
    const response = await axios.get(`${PAYROLL_SERVICE_URL}/v1/payslips/list`, {
      params: req.query,
      headers: req.headers,
      // Tell axios not to throw an error for these status codes
      validateStatus: function (status) {
        return (status >= 200 && status < 300) || status === 304;
      }
    });
    
    // Forward the same status code and response
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error forwarding payslips list request:', error.message);
    
    // If the error has a response, return that status and data
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    
    // Otherwise return a generic 500 error
    res.status(500).json({
      error: 'Error communicating with payroll service',
      details: error.message
    });
  }
});

app.get('/v1/payslips/detail/:id', async (req, res) => {
  try {
    const response = await axios.get(`${PAYROLL_SERVICE_URL}/v1/payslips/detail/${req.params.id}`, {
      headers: req.headers
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(500).json({
      error: 'Error communicating with payroll service',
      details: error.message
    });
  }
});

app.use('/v1/salaries', payrollProxy);
app.use('/v1/attendances', payrollProxy);
app.use('/v1/attendance-deductions', payrollProxy);
app.use('/v1/payslips', payrollProxy);

// Apply proxy to all payroll service routes
app.use('/v1/payroll', payrollProxy);


// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Gateway is running' });
});

// Default route
app.get('/', (req, res) => {
  res.send('API Gateway - Microservice Payroll');
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Gateway server running on port ${PORT}`);
});