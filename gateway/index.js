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

console.log('Using AUTH_SERVICE_URL:', AUTH_SERVICE_URL);
console.log('Using EMPLOYEE_SERVICE_URL:', EMPLOYEE_SERVICE_URL);

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

// Apply proxy to auth routes
app.use('/v1/auth', (req, res, next) => {
  if (req.path === '/login' && req.method === 'POST') {
    return next('route'); // Skip proxy for login POST
  }
  return authProxy(req, res, next);
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