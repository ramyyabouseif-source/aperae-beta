// Error handling middleware
const secureErrorHandler = (err, req, res, next) => {
  // Log the error
  const logger = require('./logger');
  logger.error('Unhandled error in route handler', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    requestId: req.requestId
  });
  
  // MEDIUM-4: More explicit check to prevent error leakage
  // Only show details if explicitly enabled in development
  const isDevelopment = process.env.NODE_ENV === 'development' && 
                       process.env.ENABLE_DEBUG_ERRORS === 'true';
  
  // Default error response
  let statusCode = 500;
  let message = 'Internal Server Error';
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Unauthorized';
  } else if (err.name === 'ForbiddenError') {
    statusCode = 403;
    message = 'Forbidden';
  } else if (err.name === 'NotFoundError') {
    statusCode = 404;
    message = 'Not Found';
  }
  
  // Send error response
  res.status(statusCode).json({
    error: message,
    ...(isDevelopment && { details: err.message, stack: err.stack }),
    requestId: req.requestId || 'unknown'
  });
};

module.exports = secureErrorHandler;