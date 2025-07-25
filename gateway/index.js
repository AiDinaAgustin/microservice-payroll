const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const healthChecker = require('./services/healthChecker'); // ➕ Add this

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

  // ➕ Service health status endpoint
  app.get('/health/services', (req, res) => {
    const serviceStatus = healthChecker.getServiceStatus();
    res.status(200).json({
      gateway: 'healthy',
      services: serviceStatus,
      timestamp: new Date().toISOString()
    });
  });

  // Default route
  app.get('/', (req, res) => {
    res.send('API Gateway - Microservice Payroll with Failover Support');
  });
};

/**
 * Configure error handling middleware
 */
// Modifikasi error handler untuk lebih testable
// Error handler dengan pemisahan kondisi untuk meningkatkan branch coverage
const setupErrorHandlers = (app) => {
  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ 
      error: 'Not Found', 
      message: `Route ${req.url} not found` 
    });
  });

  // Error handler dengan semua branch tercakup
  app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    
    let errorMessage = 'An unexpected error occurred';
    
    // Branch 1: Check if err exists (truthy)
    if (err) {
      // Branch 2: Check if err has message property
      if (err.hasOwnProperty('message')) {
        // Branch 3: Check if message is truthy (not falsy)
        if (err.message) {
          errorMessage = err.message;
        }
        // Branch 4: Special case for empty string (falsy but should be preserved)
        else if (err.message === '') {
          errorMessage = '';
        }
        // Branch 5: All other falsy values (null, undefined, false, 0, NaN)
        else {
          errorMessage = 'An unexpected error occurred';
        }
      }
      // Branch 6: err exists but no message property
      else {
        errorMessage = 'An unexpected error occurred';
      }
    }
    // Branch 7: err is falsy (null, undefined, false, 0, '', NaN)
    else {
      errorMessage = 'An unexpected error occurred';
    }
    
    res.status(500).json({
      error: 'Internal Server Error',
      message: errorMessage
    });
  });
};
// Function untuk setup aplikasi dengan opsi konfigurasi
const createApp = (options = {}) => {
  const app = express();
  
  // Setup aplikasi
  setupMiddleware(app);
  const serviceUrls = getServiceUrls();
  setupRoutes(app, serviceUrls);
  
  // ➕ Start health monitoring
  if (process.env.ENABLE_SERVICE_FAILOVER === 'true') {
    healthChecker.startMonitoring();
  }
  
  const shouldSetupErrorHandlers = options.withErrorHandlers;
  
  if (shouldSetupErrorHandlers === false) {
    console.log('Skipping error handlers setup');
  } else {
    setupErrorHandlers(app);
  }

  return app;
};

process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully');
  healthChecker.stopMonitoring();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully');
  healthChecker.stopMonitoring();
  process.exit(0);
});

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