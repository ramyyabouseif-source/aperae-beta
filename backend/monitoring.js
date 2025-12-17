const logger = require('./logger');

class MonitoringService {
  constructor() {
    this.metrics = {
      requests: {
        total: 0,
        successful: 0,
        failed: 0,
        byEndpoint: {},
        byMethod: {},
        responseTimes: [],
        fourXx: 0,
        fiveXx: 0,
      },
      errors: {
        total: 0,
        byType: {},
        byEndpoint: {},
      },
      users: {
        active: 0,
        registered: 0,
        authenticated: 0,
      },
      recommendations: {
        total: 0,
        successful: 0,
        failed: 0,
        averageResponseTime: 0,
        byDish: {},
      },
    };
    
    this.startTime = Date.now();
    this.uptime = 0;
    
    // Update uptime every minute
    setInterval(() => {
      this.uptime = Date.now() - this.startTime;
    }, 60000);
  }

  // Request tracking
  trackRequest(req, res, responseTime) {
    const endpoint = req.route?.path || req.path;
    const method = req.method;
    
    this.metrics.requests.total++;
    this.metrics.requests.responseTimes.push(responseTime);
    
    // Keep only last 1000 response times for average calculation
    if (this.metrics.requests.responseTimes.length > 1000) {
      this.metrics.requests.responseTimes.shift();
    }
    
    // Track by endpoint
    if (!this.metrics.requests.byEndpoint[endpoint]) {
      this.metrics.requests.byEndpoint[endpoint] = { total: 0, successful: 0, failed: 0 };
    }
    this.metrics.requests.byEndpoint[endpoint].total++;
    
    // Limit byEndpoint to prevent unbounded growth (keep max 100 endpoints)
    const endpoints = Object.keys(this.metrics.requests.byEndpoint);
    if (endpoints.length > 100) {
      // Remove least used endpoints
      const sorted = endpoints.sort((a, b) => 
        this.metrics.requests.byEndpoint[a].total - this.metrics.requests.byEndpoint[b].total
      );
      const toRemove = sorted.slice(0, endpoints.length - 100);
      toRemove.forEach(endpointKey => {
        delete this.metrics.requests.byEndpoint[endpointKey];
      });
    }
    
    // Track by method
    if (!this.metrics.requests.byMethod[method]) {
      this.metrics.requests.byMethod[method] = 0;
    }
    this.metrics.requests.byMethod[method]++;
    
    // Track success/failure and class
    if (res.statusCode >= 200 && res.statusCode < 400) {
      this.metrics.requests.successful++;
      this.metrics.requests.byEndpoint[endpoint].successful++;
    } else {
      this.metrics.requests.failed++;
      this.metrics.requests.byEndpoint[endpoint].failed++;
    }

    if (res.statusCode >= 400 && res.statusCode < 500) {
      this.metrics.requests.fourXx++;
    } else if (res.statusCode >= 500) {
      this.metrics.requests.fiveXx++;
    }
    
    // Log slow requests (endpoint-specific thresholds)
    // Master Chef calls take 60-90 seconds, so use higher threshold for dish-recommendations
    const slowThreshold = endpoint.includes('dish-recommendations') ? 90000 : 5000;
    if (responseTime > slowThreshold) {
      logger.warn(`Slow request detected: ${method} ${endpoint} took ${responseTime}ms`);
    }
  }

  // Error tracking
  trackError(error, req) {
    const endpoint = req.route?.path || req.path;
    const errorType = error.name || 'UnknownError';
    
    this.metrics.errors.total++;
    
    // Track by type
    if (!this.metrics.errors.byType[errorType]) {
      this.metrics.errors.byType[errorType] = 0;
    }
    this.metrics.errors.byType[errorType]++;
    
    // Limit byType to prevent unbounded growth (keep max 50 error types)
    const errorTypes = Object.keys(this.metrics.errors.byType);
    if (errorTypes.length > 50) {
      const sorted = errorTypes.sort((a, b) => 
        this.metrics.errors.byType[a] - this.metrics.errors.byType[b]
      );
      const toRemove = sorted.slice(0, errorTypes.length - 50);
      toRemove.forEach(errorTypeKey => {
        delete this.metrics.errors.byType[errorTypeKey];
      });
    }
    
    // Track by endpoint
    if (!this.metrics.errors.byEndpoint[endpoint]) {
      this.metrics.errors.byEndpoint[endpoint] = 0;
    }
    this.metrics.errors.byEndpoint[endpoint]++;
    
    // Limit byEndpoint to prevent unbounded growth (keep max 100 endpoints)
    const errorEndpoints = Object.keys(this.metrics.errors.byEndpoint);
    if (errorEndpoints.length > 100) {
      const sorted = errorEndpoints.sort((a, b) => 
        this.metrics.errors.byEndpoint[a] - this.metrics.errors.byEndpoint[b]
      );
      const toRemove = sorted.slice(0, errorEndpoints.length - 100);
      toRemove.forEach(endpointKey => {
        delete this.metrics.errors.byEndpoint[endpointKey];
      });
    }
    
    logger.error(`Error tracked: ${errorType} on ${endpoint}`, {
      error: error.message,
      stack: error.stack,
      requestId: req.requestId,
    });
  }

  // Recommendation tracking
  trackRecommendation(dish, success, responseTime) {
    this.metrics.recommendations.total++;
    
    if (success) {
      this.metrics.recommendations.successful++;
    } else {
      this.metrics.recommendations.failed++;
    }
    
    // Track by dish (simplified)
    const dishCategory = this.categorizeDish(dish);
    if (!this.metrics.recommendations.byDish[dishCategory]) {
      this.metrics.recommendations.byDish[dishCategory] = 0;
    }
    this.metrics.recommendations.byDish[dishCategory]++;
    
    // Limit growth to prevent unbounded memory usage (keep max 50 categories)
    const dishCategories = Object.keys(this.metrics.recommendations.byDish);
    if (dishCategories.length > 50) {
      // Remove least used categories (sort by count, remove smallest)
      const sorted = dishCategories.sort((a, b) => 
        this.metrics.recommendations.byDish[a] - this.metrics.recommendations.byDish[b]
      );
      const toRemove = sorted.slice(0, dishCategories.length - 50);
      toRemove.forEach(category => {
        delete this.metrics.recommendations.byDish[category];
      });
      logger.debug(`Cleaned up old dish categories, removed ${toRemove.length} entries`);
    }
    
    // Update average response time
    const totalTime = this.metrics.recommendations.averageResponseTime * 
      (this.metrics.recommendations.successful - 1) + responseTime;
    this.metrics.recommendations.averageResponseTime = 
      totalTime / this.metrics.recommendations.successful;
  }

  // User tracking
  trackUserRegistration() {
    this.metrics.users.registered++;
    logger.info('User registered', { totalUsers: this.metrics.users.registered });
  }

  trackUserLogin() {
    this.metrics.users.authenticated++;
    this.metrics.users.active++;
    logger.info('User logged in', { 
      activeUsers: this.metrics.users.active,
      authenticatedUsers: this.metrics.users.authenticated 
    });
  }

  trackUserLogout() {
    this.metrics.users.active = Math.max(0, this.metrics.users.active - 1);
    logger.info('User logged out', { activeUsers: this.metrics.users.active });
  }

  // Helper method to categorize dishes
  categorizeDish(dish) {
    const dishLower = dish.toLowerCase();
    
    if (dishLower.includes('steak') || dishLower.includes('beef')) return 'Red Meat';
    if (dishLower.includes('chicken') || dishLower.includes('poultry')) return 'Poultry';
    if (dishLower.includes('fish') || dishLower.includes('salmon') || dishLower.includes('seafood')) return 'Seafood';
    if (dishLower.includes('pasta') || dishLower.includes('pizza')) return 'Italian';
    if (dishLower.includes('salad') || dishLower.includes('vegetable')) return 'Vegetarian';
    if (dishLower.includes('dessert') || dishLower.includes('cake') || dishLower.includes('chocolate')) return 'Dessert';
    
    return 'Other';
  }

  // Get current metrics
  getMetrics() {
    const averageResponseTime = this.metrics.requests.responseTimes.length > 0
      ? this.metrics.requests.responseTimes.reduce((a, b) => a + b, 0) / this.metrics.requests.responseTimes.length
      : 0;

    // p95/p99 latency
    const sorted = [...this.metrics.requests.responseTimes].sort((a, b) => a - b);
    const percentile = (arr, p) => {
      if (arr.length === 0) return 0;
      const idx = Math.ceil((p / 100) * arr.length) - 1;
      return arr[Math.min(Math.max(idx, 0), arr.length - 1)];
    };
    const p95 = percentile(sorted, 95);
    const p99 = percentile(sorted, 99);

    return {
      ...this.metrics,
      requests: {
        ...this.metrics.requests,
        averageResponseTime: Math.round(averageResponseTime),
        p95: Math.round(p95),
        p99: Math.round(p99),
      },
      uptime: this.uptime,
      uptimeFormatted: this.formatUptime(this.uptime),
      timestamp: new Date().toISOString(),
    };
  }

  // Format uptime in human readable format
  formatUptime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }

  // Health check
  getHealthStatus() {
    const errorRate = this.metrics.requests.total > 0 
      ? (this.metrics.requests.failed / this.metrics.requests.total) * 100 
      : 0;

    const status = errorRate > 10 ? 'unhealthy' : errorRate > 5 ? 'degraded' : 'healthy';

    return {
      status,
      errorRate: Math.round(errorRate * 100) / 100,
      uptime: this.uptime,
      requests: this.metrics.requests.total,
      errors: this.metrics.errors.total,
      recommendations: this.metrics.recommendations.total,
      timestamp: new Date().toISOString(),
    };
  }

  // Reset metrics (useful for testing)
  resetMetrics() {
    this.metrics = {
      requests: {
        total: 0,
        successful: 0,
        failed: 0,
        byEndpoint: {},
        byMethod: {},
        responseTimes: [],
      },
      errors: {
        total: 0,
        byType: {},
        byEndpoint: {},
      },
      users: {
        active: 0,
        registered: 0,
        authenticated: 0,
      },
      recommendations: {
        total: 0,
        successful: 0,
        failed: 0,
        averageResponseTime: 0,
        byDish: {},
      },
    };
    this.startTime = Date.now();
    this.uptime = 0;
  }
}

module.exports = new MonitoringService();




