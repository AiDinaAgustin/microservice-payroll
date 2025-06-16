const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import route modules
const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employee');
const payrollRoutes = require('./routes/payroll');

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

// Mount route modules with their respective service URLs
app.use('/v1/auth', authRoutes(AUTH_SERVICE_URL));
app.use('/v1', employeeRoutes(EMPLOYEE_SERVICE_URL));
app.use('/v1', payrollRoutes(PAYROLL_SERVICE_URL));

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