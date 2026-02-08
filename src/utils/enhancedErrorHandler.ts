/**
 * Enhanced Error Handler with User-Friendly Messages and Recovery Actions
 * Provides contextual error messages and actionable recovery options
 */

export interface ErrorRecoveryAction {
  label: string;
  action: () => void;
  variant: 'primary' | 'secondary' | 'danger';
}

export interface EnhancedError {
  title: string;
  message: string;
  recoveryActions: ErrorRecoveryAction[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'network' | 'validation' | 'authentication' | 'server' | 'unknown';
  timestamp: Date;
  context?: Record<string, any>;
}

export class EnhancedErrorHandler {
  /**
   * Creates user-friendly error messages with recovery actions
   * @param error - The original error
   * @param context - Additional context about where the error occurred
   * @returns Enhanced error with user-friendly message and recovery options
   */
  static createEnhancedError(
    error: any,
    context?: {
      operation?: string;
      component?: string;
      userAction?: string;
      retryable?: boolean;
    }
  ): EnhancedError {
    const timestamp = new Date();
    const baseContext = {
      operation: context?.operation || 'unknown',
      component: context?.component || 'unknown',
      userAction: context?.userAction || 'unknown',
    };

    // Network errors
    if (error.message?.includes('Network') || error.code === 'NETWORK_ERROR') {
      return {
        title: 'Connection Problem',
        message: 'Unable to connect to our servers. Please check your internet connection.',
        recoveryActions: [
          {
            label: 'Try Again',
            action: () => this.retryOperation(context?.operation),
            variant: 'primary',
          },
          {
            label: 'Check Connection',
            action: () => this.openNetworkSettings(),
            variant: 'secondary',
          },
        ],
        severity: 'medium',
        category: 'network',
        timestamp,
        context: baseContext,
      };
    }

    // Validation errors
    if (error.message?.includes('validation') || 
        error.type === 'VALIDATION_ERROR' ||
        error.message?.includes('Please enter') ||
        error.message?.includes('required') ||
        error.message?.includes('Invalid input') ||
        error.message?.includes('dish') ||
        error.message?.includes('Dish name is required') ||
        error.message?.includes('must be') ||
        context?.operation === 'validateInput' ||
        context?.operation === 'validateDishInput') {
      return {
        title: error.message?.includes('Dish name is required') ? 'Dish Required' : 'Input Required',
        message: error.message?.includes('dish') || error.message?.includes('Dish') 
          ? (error.message || 'Please enter a dish or food item to get wine recommendations.')
          : (error.message || 'Please check your input and try again.'),
        recoveryActions: [
          {
            label: error.message?.includes('dish') || error.message?.includes('Dish') ? 'Enter Dish' : 'Fix Input',
            action: () => this.focusInputField(),
            variant: 'primary',
          },
          {
            label: error.message?.includes('dish') || error.message?.includes('Dish') ? 'Clear Field' : 'Clear Form',
            action: () => this.clearForm(),
            variant: 'secondary',
          },
        ],
        severity: 'low',
        category: 'validation',
        timestamp,
        context: baseContext,
      };
    }

    // Server errors
    if (error.status >= 500 || error.message?.includes('server')) {
      return {
        title: 'Server Error',
        message: 'Our servers are experiencing issues. We\'re working to fix this quickly.',
        recoveryActions: [
          {
            label: 'Try Again',
            action: () => this.retryOperation(context?.operation),
            variant: 'primary',
          },
          {
            label: 'Report Issue',
            action: () => this.reportIssue(error),
            variant: 'secondary',
          },
        ],
        severity: 'high',
        category: 'server',
        timestamp,
        context: baseContext,
      };
    }

    // Geo-blocking errors (403 with GEO_BLOCKED code)
    if (error.status === 403 && (error.code === 'GEO_BLOCKED' || error.message?.includes('not available in your region'))) {
      return {
        title: 'Service Not Available',
        message: error.message || 'Aperae is currently available in the United States only.',
        recoveryActions: [
          {
            label: 'Contact Support',
            action: () => this.reportIssue(error),
            variant: 'primary',
          },
        ],
        severity: 'medium',
        category: 'geo-blocking',
        timestamp,
        context: {
          ...baseContext,
          country: error.country,
          countryName: error.countryName,
        },
      };
    }

    // Forbidden errors (403)
    if (error.status === 403) {
      return {
        title: 'Access Denied',
        message: error.message || 'You do not have permission to access this resource.',
        recoveryActions: [
          {
            label: 'Go Back',
            action: () => this.navigateToSignIn(),
            variant: 'primary',
          },
        ],
        severity: 'medium',
        category: 'authorization',
        timestamp,
        context: baseContext,
      };
    }

    // Authentication errors
    if (error.status === 401 || error.message?.includes('unauthorized')) {
      return {
        title: 'Authentication Required',
        message: 'Please sign in again to continue using the app.',
        recoveryActions: [
          {
            label: 'Sign In',
            action: () => this.navigateToSignIn(),
            variant: 'primary',
          },
          {
            label: 'Continue Offline',
            action: () => this.enableOfflineMode(),
            variant: 'secondary',
          },
        ],
        severity: 'medium',
        category: 'authentication',
        timestamp,
        context: baseContext,
      };
    }

    // API/recommendation failures - preserve user-friendly message
    if (error.message?.includes('Something went wrong') || error.message?.includes('Please try again')) {
      return {
        title: 'Something Went Wrong',
        message: error.message || 'Something went wrong. Please try again.',
        recoveryActions: [
          {
            label: 'Try Again',
            action: () => this.retryOperation(context?.operation),
            variant: 'primary',
          },
        ],
        severity: 'medium',
        category: 'server',
        timestamp,
        context: baseContext,
      };
    }

    // Default error
    return {
      title: 'Something Went Wrong',
      message: 'An unexpected error occurred. Our team has been notified.',
      recoveryActions: [
        {
          label: 'Try Again',
          action: () => this.retryOperation(context?.operation),
          variant: 'primary',
        },
        {
          label: 'Report Issue',
          action: () => this.reportIssue(error),
          variant: 'secondary',
        },
      ],
      severity: 'medium',
      category: 'unknown',
      timestamp,
      context: baseContext,
    };
  }

  /**
   * Retries the specified operation
   */
  private static retryOperation(operation?: string): void {
    // This would be implemented based on the specific operation
    console.log(`Retrying operation: ${operation}`);
    // In a real implementation, this would trigger the retry logic
  }

  /**
   * Opens network settings (platform-specific)
   */
  private static openNetworkSettings(): void {
    // Platform-specific implementation
    console.log('Opening network settings');
  }

  /**
   * Focuses the input field that caused validation error
   */
  private static focusInputField(): void {
    console.log('Focusing input field');
  }

  /**
   * Clears the form
   */
  private static clearForm(): void {
    console.log('Clearing form');
  }

  /**
   * Reports the issue to support
   */
  private static reportIssue(error: any): void {
    console.log('Reporting issue:', error);
  }

  /**
   * Navigates to sign-in screen
   */
  private static navigateToSignIn(): void {
    console.log('Navigating to sign-in');
  }

  /**
   * Enables offline mode
   */
  private static enableOfflineMode(): void {
    console.log('Enabling offline mode');
  }

  /**
   * Logs error for monitoring and debugging
   */
  static logError(enhancedError: EnhancedError): void {
    console.error('Enhanced Error:', {
      title: enhancedError.title,
      message: enhancedError.message,
      severity: enhancedError.severity,
      category: enhancedError.category,
      timestamp: enhancedError.timestamp,
      context: enhancedError.context,
    });
  }
}
