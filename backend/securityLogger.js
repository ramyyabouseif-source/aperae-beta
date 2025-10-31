const securityLogger = (req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    // Log security-relevant events
    if (res.statusCode >= 400) {
      console.warn(`�� Security Event: ${req.method} ${req.path} - ${res.statusCode} - ${req.ip} - ${duration}ms - ID: ${req.requestId}`);
    }
    
    // Log rate limit hits
    if (res.statusCode === 429) {
      console.warn(`⚠️ Rate limit exceeded: ${req.ip} - ${req.path} - ID: ${req.requestId}`);
    }
    
    // Log successful requests for monitoring
    if (res.statusCode === 200) {
      console.log(`✅ Request: ${req.method} ${req.path} - ${req.ip} - ${duration}ms - ID: ${req.requestId}`);
    }
  });
  
  next();
};

module.exports = securityLogger;