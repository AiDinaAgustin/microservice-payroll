// REFACTOR
const axios = require('axios');
const FormData = require('form-data');

/**
 * Forward a request to a service endpoint
 */
const forwardRequest = async (serviceUrl, path, req, res, options = {}) => {
  const method = req.method.toLowerCase();
  const url = `${serviceUrl}${path}`;
  console.log(`${method.toUpperCase()} request to ${url}`);
  
  try {
    const config = {
      method,
      url,
      headers: req.headers,
      validateStatus: function (status) {
        return (status >= 200 && status < 300) || status === 304;
      },
      ...options
    };
    
    // Add request body for POST/PUT/PATCH
    if (['post', 'put', 'patch'].includes(method)) {
      config.data = req.body;
    }
    
    // Add query params for all methods
    if (Object.keys(req.query).length > 0) {
      config.params = req.query;
    }
    
    // Handle file uploads
    if (req.file && method === 'post') {
      const formData = new FormData();
      formData.append('file', req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype
      });
      config.data = formData;
      config.headers = {
        ...config.headers,
        'Content-Type': 'multipart/form-data'
      };
    }
    
    // Handle file downloads
    if (req.query.download === 'true' || path.includes('/download')) {
      config.responseType = 'stream';
    }
    
    const response = await axios(config);
    
    // Handle file download responses
    if (config.responseType === 'stream') {
      res.setHeader('Content-Type', response.headers['content-type']);
      if (response.headers['content-disposition']) {
        res.setHeader('Content-Disposition', response.headers['content-disposition']);
      }
      return response.data.pipe(res);
    }
    
    // Set the status code
    res.status(response.status);
    
    // If we have data or not a 304, send JSON response
    if (response.data || response.status !== 304) {
      res.json(response.data);
    } else if (response.status === 304) {
      res.end(); // Send empty response for 304
    }
  } catch (error) {
    console.error(`Error forwarding ${method} request to ${url}:`, error.message);
    
    // If we have a specific error response, use it
    if (error.response) {
      console.error('Error response status:', error.response.status);
      console.error('Error response data:', JSON.stringify(error.response.data, null, 2));
      return res.status(error.response.status).json(error.response.data);
    }
    
    // Otherwise return a generic 500 error
    res.status(500).json({
      error: `Error communicating with service`,
      details: error.message
    });
  }
};

module.exports = {
  forwardRequest
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