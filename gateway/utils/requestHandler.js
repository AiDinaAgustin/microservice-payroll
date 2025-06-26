// REFACTOR
const axios = require('axios');

/**
 * Service configuration dengan failover mapping
 */
const getServiceMapping = () => {
  return {
    employees: {
      primary: process.env.EMPLOYEE_SERVICE_URL || 'http://localhost:5002',
      fallback: process.env.PAYROLL_SERVICE_URL || 'http://localhost:5003'
    },
    departments: {
      primary: process.env.EMPLOYEE_SERVICE_URL || 'http://localhost:5002',
      fallback: process.env.PAYROLL_SERVICE_URL || 'http://localhost:5003'
    },
    positions: {
      primary: process.env.EMPLOYEE_SERVICE_URL || 'http://localhost:5002',
      fallback: process.env.PAYROLL_SERVICE_URL || 'http://localhost:5003'
    },
    'contract-types': {
      primary: process.env.EMPLOYEE_SERVICE_URL || 'http://localhost:5002',
      fallback: process.env.PAYROLL_SERVICE_URL || 'http://localhost:5003'
    },
    'marital-status': {
      primary: process.env.EMPLOYEE_SERVICE_URL || 'http://localhost:5002',
      fallback: process.env.PAYROLL_SERVICE_URL || 'http://localhost:5003'
    }
  };
};

/**
 * Determine service type from path
 */
const getServiceTypeFromPath = (path) => {
  const pathSegments = path.split('/');
  
  // Extract service type from path like /v1/employees/list
  if (pathSegments.length >= 3) {
    const serviceType = pathSegments[2];
    return serviceType;
  }
  
  return null;
};

/**
 * Check if service is available
 */
const checkServiceHealth = async (serviceUrl) => {
  try {
    const response = await axios.get(`${serviceUrl}/health`, {
      timeout: 5000,
      validateStatus: (status) => status === 200
    });
    return true;
  } catch (error) {
    console.warn(`Service health check failed for ${serviceUrl}:`, error.message);
    return false;
  }
};

/**
 * Forward request with failover capability
 */
const forwardRequestWithFailover = async (primaryServiceUrl, path, req, res, options = {}) => {
  const serviceType = getServiceTypeFromPath(path);
  const serviceMapping = getServiceMapping();
  
  console.log(`🔍 Analyzing path: ${path}, extracted service type: ${serviceType}`);
  
  // Check if this service type has failover configuration
  const hasFailover = serviceMapping[serviceType];
  
  if (!hasFailover) {
    console.log(`⚠️ No failover configured for ${serviceType}, using original forward logic`);
    return forwardRequest(primaryServiceUrl, path, req, res, options);
  }
  
  const { primary, fallback } = serviceMapping[serviceType];
  
  try {
    // Try primary service first
    console.log(`🎯 Trying primary service for ${serviceType}: ${primary}`);
    await forwardRequest(primary, path, req, res, options);
    console.log(`✅ Primary service succeeded for ${serviceType}`);
  } catch (primaryError) {
    console.warn(`❌ Primary service failed for ${serviceType}:`, primaryError.message);
    
    try {
      // Try fallback service
      console.log(`🔄 Failing over to fallback service for ${serviceType}: ${fallback}`);
      await forwardRequest(fallback, path, req, res, options);
      
      // Log successful failover
      console.log(`✅ Successfully failed over ${serviceType} request to ${fallback}`);
    } catch (fallbackError) {
      console.error(`💥 Both primary and fallback services failed for ${serviceType}`);
      console.error('Primary error:', primaryError.message);
      console.error('Fallback error:', fallbackError.message);
      
      // Return service unavailable error
      if (!res.headersSent) {
        res.status(503).json({
          error: 'Service Unavailable',
          message: `Both primary and fallback services for ${serviceType} are currently unavailable`,
          details: {
            primaryService: primary,
            fallbackService: fallback,
            primaryError: primaryError.message,
            fallbackError: fallbackError.message
          }
        });
      }
    }
  }
};

/**
 * Original forward request function
 */
const forwardRequest = async (serviceUrl, path, req, res, options = {}) => {
  try {
    const config = {
      method: req.method,
      url: `${serviceUrl}${path}`,
      timeout: 10000,
      headers: {
        ...req.headers,
        host: undefined,
      },
      params: req.query,
      ...options
    };

    // Add request body for non-GET requests
    if (req.method !== 'GET' && req.body) {
      config.data = req.body;
    }

    // Handle file uploads
    if (req.file) {
      const FormData = require('form-data');
      const formData = new FormData();
      formData.append('file', req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype
      });
      config.data = formData;
      config.headers = {
        ...config.headers,
        ...formData.getHeaders()
      };
    }

    console.log(`📤 Making request: ${config.method} ${config.url}`);
    const response = await axios(config);
    console.log(`📥 Response received: ${response.status}`);
    
    // Handle different response types
    if (options.responseType === 'stream') {
      response.data.pipe(res);
    } else {
      // ➕ Check if response was already sent
      if (!res.headersSent) {
        res.status(response.status).json(response.data);
      }
    }
  } catch (error) {
    console.error(`Request forwarding failed to ${serviceUrl}${path}:`, error.message);
    
    if (error.response) {
      // ➕ Check if response was already sent
      if (!res.headersSent) {
        res.status(error.response.status).json(error.response.data);
      }
      // Don't throw error, let caller handle response
      return;
    } else if (error.request) {
      throw new Error(`Service ${serviceUrl} is not responding`);
    } else {
      throw new Error(`Request configuration error: ${error.message}`);
    }
  }
};

module.exports = { 
  forwardRequest, 
  forwardRequestWithFailover,
  checkServiceHealth,
  getServiceMapping 
};

// GREEN
// const axios = require('axios');

// /**
//  * Forward a request to a service endpoint
//  */
// const forwardRequest = async (serviceUrl, path, req, res) => {
//   const method = req.method.toLowerCase();
//   const url = `${serviceUrl}${path}`;
//   console.log(`${method.toUpperCase()} request to ${url}`);
  
//   try {
//     const config = {
//       method,
//       url,
//       headers: req.headers,
//       validateStatus: function (status) {
//         return (status >= 200 && status < 300) || status === 304;
//       }
//     };
    
//     // Add request body for POST/PUT/PATCH
//     if (['post', 'put', 'patch'].includes(method)) {
//       config.data = req.body;
//     }
    
//     // Add query params
//     if (Object.keys(req.query).length > 0) {
//       config.params = req.query;
//     }
    
//     const response = await axios(config);
    
//     // Set the status code
//     res.status(response.status);
    
//     // If we have data or not a 304, send JSON response
//     if (response.data || response.status !== 304) {
//       res.json(response.data);
//     } else if (response.status === 304) {
//       res.end(); // Send empty response for 304
//     }
//   } catch (error) {
//     console.error(`Error forwarding ${method} request to ${url}:`, error.message);
    
//     // If we have a specific error response, use it
//     if (error.response) {
//       return res.status(error.response.status).json(error.response.data);
//     }
    
//     // Otherwise return a generic 500 error
//     res.status(500).json({
//       error: `Error communicating with service`,
//       details: error.message
//     });
//   }
// };

// module.exports = {
//   forwardRequest
// };