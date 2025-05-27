const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const dotenv = require('dotenv');
const axios = require('axios'); // You'll need to install this

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Auth service configuration
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:5001';
console.log('Using AUTH_SERVICE_URL:', AUTH_SERVICE_URL);

// Instead of proxy middleware, use a direct approach for login
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

// Use proxy for other auth routes
const authProxy = createProxyMiddleware({
  target: AUTH_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: null,
  logLevel: 'debug'
});

// Apply proxy to all other auth routes
app.use('/v1/auth', (req, res, next) => {
  if (req.path === '/login' && req.method === 'POST') {
    return next('route'); // Skip proxy for login POST
  }
  return authProxy(req, res, next);
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