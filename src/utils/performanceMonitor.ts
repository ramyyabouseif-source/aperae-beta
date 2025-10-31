/**
 * Performance Monitoring Utility
 * Tracks app performance metrics including render times, API calls, and user interactions
 */

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

interface ApiPerformanceMetric extends PerformanceMetric {
  url: string;
  method: string;
  statusCode?: number;
  responseSize?: number;
}

interface RenderPerformanceMetric extends PerformanceMetric {
  component: string;
  renderCount: number;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private apiMetrics: ApiPerformanceMetric[] = [];
  private renderMetrics: RenderPerformanceMetric[] = [];
  private isEnabled: boolean = __DEV__; // Only enabled in development by default

  /**
   * Enables or disables performance monitoring
   * @param enabled - Whether to enable monitoring
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Starts timing a performance metric
   * @param name - Unique name for the metric
   * @param metadata - Additional data to track
   * @returns The metric ID for ending the timer
   */
  startTiming(name: string, metadata?: Record<string, any>): string {
    if (!this.isEnabled) return name;

    const metric: PerformanceMetric = {
      name,
      startTime: performance.now(),
      metadata,
    };

    this.metrics.set(name, metric);
    return name;
  }

  /**
   * Ends timing a performance metric
   * @param name - The metric name returned from startTiming
   * @param additionalMetadata - Additional data to add when ending
   */
  endTiming(name: string, additionalMetadata?: Record<string, any>): void {
    if (!this.isEnabled) return;

    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`Performance metric "${name}" not found`);
      return;
    }

    const endTime = performance.now();
    const duration = endTime - metric.startTime;

    metric.endTime = endTime;
    metric.duration = duration;

    if (additionalMetadata) {
      metric.metadata = { ...metric.metadata, ...additionalMetadata };
    }

    // Log significant performance issues
    if (duration > 1000) {
      if (name.includes('api') || name.includes('recommendations')) {
        // API calls should be faster than 30 seconds (matching timeout)
        if (duration > 30000) {
          console.warn(`Slow API operation detected: ${name} took ${duration.toFixed(2)}ms`);
        }
      } else {
        // UI operations should be faster than 1 second
        console.warn(`Slow operation detected: ${name} took ${duration.toFixed(2)}ms`);
      }
    }

    // Store completed metrics
    this.metrics.delete(name);
  }

  /**
   * Tracks API call performance
   * @param url - The API endpoint URL
   * @param method - HTTP method
   * @param startTime - When the request started
   * @param endTime - When the request completed
   * @param statusCode - HTTP status code
   * @param responseSize - Size of response in bytes
   */
  trackApiCall(
    url: string,
    method: string,
    startTime: number,
    endTime: number,
    statusCode?: number,
    responseSize?: number
  ): void {
    if (!this.isEnabled) return;

    const duration = endTime - startTime;
    const metric: ApiPerformanceMetric = {
      name: `API_${method}_${url}`,
      startTime,
      endTime,
      duration,
      url,
      method,
      statusCode,
      responseSize,
    };

    this.apiMetrics.push(metric);

    // Log slow API calls
    if (duration > 2000) {
      console.warn(`Slow API call: ${method} ${url} took ${duration.toFixed(2)}ms`);
    }

    // Keep only last 100 API metrics to prevent memory leaks
    if (this.apiMetrics.length > 100) {
      this.apiMetrics = this.apiMetrics.slice(-100);
    }
  }

  /**
   * Tracks component render performance
   * @param component - Component name
   * @param renderTime - Time taken to render
   * @param renderCount - Number of times component has rendered
   */
  trackRender(component: string, renderTime: number, renderCount: number): void {
    if (!this.isEnabled) return;

    const metric: RenderPerformanceMetric = {
      name: `RENDER_${component}`,
      startTime: performance.now() - renderTime,
      endTime: performance.now(),
      duration: renderTime,
      component,
      renderCount,
    };

    this.renderMetrics.push(metric);

    // Log slow renders
    if (renderTime > 16) { // More than one frame at 60fps
      console.warn(`Slow render detected: ${component} took ${renderTime.toFixed(2)}ms`);
    }

    // Keep only last 50 render metrics
    if (this.renderMetrics.length > 50) {
      this.renderMetrics = this.renderMetrics.slice(-50);
    }
  }

  /**
   * Gets performance summary
   * @returns Summary of all tracked metrics
   */
  getPerformanceSummary(): {
    apiMetrics: {
      totalCalls: number;
      averageResponseTime: number;
      slowestCall: ApiPerformanceMetric | null;
      errorRate: number;
    };
    renderMetrics: {
      totalRenders: number;
      averageRenderTime: number;
      slowestRender: RenderPerformanceMetric | null;
    };
  } {
    const apiSummary = {
      totalCalls: this.apiMetrics.length,
      averageResponseTime: 0,
      slowestCall: null as ApiPerformanceMetric | null,
      errorRate: 0,
    };

    if (this.apiMetrics.length > 0) {
      const totalTime = this.apiMetrics.reduce((sum, metric) => sum + (metric.duration || 0), 0);
      apiSummary.averageResponseTime = totalTime / this.apiMetrics.length;

      apiSummary.slowestCall = this.apiMetrics.reduce((slowest, current) => 
        (current.duration || 0) > (slowest.duration || 0) ? current : slowest
      );

      const errorCount = this.apiMetrics.filter(metric => 
        metric.statusCode && metric.statusCode >= 400
      ).length;
      apiSummary.errorRate = (errorCount / this.apiMetrics.length) * 100;
    }

    const renderSummary = {
      totalRenders: this.renderMetrics.length,
      averageRenderTime: 0,
      slowestRender: null as RenderPerformanceMetric | null,
    };

    if (this.renderMetrics.length > 0) {
      const totalTime = this.renderMetrics.reduce((sum, metric) => sum + (metric.duration || 0), 0);
      renderSummary.averageRenderTime = totalTime / this.renderMetrics.length;

      renderSummary.slowestRender = this.renderMetrics.reduce((slowest, current) => 
        (current.duration || 0) > (slowest.duration || 0) ? current : slowest
      );
    }

    return {
      apiMetrics: apiSummary,
      renderMetrics: renderSummary,
    };
  }

  /**
   * Clears all performance metrics
   */
  clearMetrics(): void {
    this.metrics.clear();
    this.apiMetrics = [];
    this.renderMetrics = [];
  }

  /**
   * Logs current performance summary to console
   */
  logPerformanceSummary(): void {
    if (!this.isEnabled) return;

    const summary = this.getPerformanceSummary();
    
    console.log('=== PERFORMANCE SUMMARY ===');
    console.log('API Metrics:', {
      totalCalls: summary.apiMetrics.totalCalls,
      averageResponseTime: `${summary.apiMetrics.averageResponseTime.toFixed(2)}ms`,
      slowestCall: summary.apiMetrics.slowestCall?.url,
      errorRate: `${summary.apiMetrics.errorRate.toFixed(1)}%`,
    });
    
    console.log('Render Metrics:', {
      totalRenders: summary.renderMetrics.totalRenders,
      averageRenderTime: `${summary.renderMetrics.averageRenderTime.toFixed(2)}ms`,
      slowestRender: summary.renderMetrics.slowestRender?.component,
    });
    console.log('==========================');
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

export default performanceMonitor;
export { PerformanceMonitor, PerformanceMetric, ApiPerformanceMetric, RenderPerformanceMetric };
