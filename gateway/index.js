// const express = require('express');
// const cors = require('cors');
// const dotenv = require('dotenv');

// // Load environment variables
// dotenv.config();

// // Import route modules
// const authRoutes = require('./routes/auth');
// const employeeRoutes = require('./routes/employee');
// const payrollRoutes = require('./routes/payroll');

// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Service configurations
// const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:5001';
// const EMPLOYEE_SERVICE_URL = process.env.EMPLOYEE_SERVICE_URL || 'http://localhost:5002';
// const PAYROLL_SERVICE_URL = process.env.PAYROLL_SERVICE_URL || 'http://localhost:5003';

// console.log('Using AUTH_SERVICE_URL:', AUTH_SERVICE_URL);
// console.log('Using EMPLOYEE_SERVICE_URL:', EMPLOYEE_SERVICE_URL);
// console.log('Using PAYROLL_SERVICE_URL:', PAYROLL_SERVICE_URL);

// // Mount route modules with their respective service URLs
// app.use('/v1/auth', authRoutes(AUTH_SERVICE_URL));
// app.use('/v1', employeeRoutes(EMPLOYEE_SERVICE_URL));
// app.use('/v1', payrollRoutes(PAYROLL_SERVICE_URL));

// // Health check endpoint
// app.get('/health', (req, res) => {
//   res.status(200).json({ status: 'Gateway is running' });
// });

// // Default route
// app.get('/', (req, res) => {
//   res.send('API Gateway - Microservice Payroll');
// });

// // Start the server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Gateway server running on port ${PORT}`);
// });



// ================================================
// REFACTOR
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import route modules
const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employee');
const payrollRoutes = require('./routes/payroll');

/**
 * Configure middleware for Express application
 */
const setupMiddleware = (app) => {
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
};

/**
 * Configure service URLs from environment
 */
const getServiceUrls = () => {
  const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:5001';
  const EMPLOYEE_SERVICE_URL = process.env.EMPLOYEE_SERVICE_URL || 'http://localhost:5002';
  const PAYROLL_SERVICE_URL = process.env.PAYROLL_SERVICE_URL || 'http://localhost:5003';

  console.log('Using AUTH_SERVICE_URL:', AUTH_SERVICE_URL);
  console.log('Using EMPLOYEE_SERVICE_URL:', EMPLOYEE_SERVICE_URL);
  console.log('Using PAYROLL_SERVICE_URL:', PAYROLL_SERVICE_URL);

  return {
    AUTH_SERVICE_URL,
    EMPLOYEE_SERVICE_URL,
    PAYROLL_SERVICE_URL
  };
};

/**
 * Set up API routes
 */
const setupRoutes = (app, serviceUrls) => {
  // Mount route modules with their respective service URLs
  app.use('/v1/auth', authRoutes(serviceUrls.AUTH_SERVICE_URL));
  app.use('/v1', employeeRoutes(serviceUrls.EMPLOYEE_SERVICE_URL));
  app.use('/v1', payrollRoutes(serviceUrls.PAYROLL_SERVICE_URL));

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'Gateway is running' });
  });

  // Default route
  app.get('/', (req, res) => {
    res.send('API Gateway - Microservice Payroll');
  });
};

/**
 * Configure error handling middleware
 */
const setupErrorHandlers = (app) => {
  // 404 handler - must be defined after all valid routes
  app.use((req, res) => {
    res.status(404).json({ error: 'Not Found', message: `Route ${req.url} not found` });
  });

  // Error handler
  app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
      error: 'Internal Server Error',
      message: err.message || 'An unexpected error occurred'
    });
  });
};

/**
 * Create and configure Express application
 */
// Modifikasi fungsi createApp untuk menerima opsi
const createApp = (options = {}) => {
  const app = express();
  
  // Setup application
  setupMiddleware(app);
  const serviceUrls = getServiceUrls();
  setupRoutes(app, serviceUrls);
  
  // Tambahkan error handlers hanya jika diminta (default: true)
  if (options.withErrorHandlers !== false) {
    setupErrorHandlers(app);
  }

  return app;
};

/**
 * Start the server
 */
const startServer = (app, port = process.env.PORT || 5000) => {
  return app.listen(port, () => {
    console.log(`Gateway server running on port ${port}`);
  });
};

// Start server if file is executed directly (not imported in tests)
if (require.main === module) {
  const app = createApp();
  startServer(app);
}

module.exports = { createApp, startServer, setupErrorHandlers };