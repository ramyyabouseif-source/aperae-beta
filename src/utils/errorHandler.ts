export class SecureErrorHandler {
  static sanitizeError(error: any): string {
    // Don't expose internal error details
    if (error.message) {
      // Only show safe error messages
      const safeErrors = [
        'Network request failed',
        'Request timeout',
        'Invalid input',
        'Server error',
        'Authentication failed'
      ];
      
      if (safeErrors.some(safeError => error.message.includes(safeError))) {
        return error.message;
      }
    }
    
    // Default to generic error message
    return 'An unexpected error occurred. Please try again.';
  }
  
  static logError(error: any, context: string): void {
    // Log detailed error for debugging (but don't expose to user)
    console.error(`Error in ${context}:`, {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }
  
  static getErrorMessage(error: any, context: string): string {
    this.logError(error, context);
    return this.sanitizeError(error);
  }
}