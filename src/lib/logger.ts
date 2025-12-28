/**
 * Structured logging utility with environment-aware log levels
 *
 * In development: All logs are shown with context
 * In production: Only info, warn, and error logs are shown
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private isDev: boolean;

  constructor() {
    // Check if we're in development mode
    this.isDev = process.env.NODE_ENV === 'development';
  }

  /**
   * Debug-level logging (development only)
   * Use for detailed debugging information
   * @param context - Component or module name (e.g., 'ChatPanel', 'useChatAPI')
   * @param message - Optional message
   * @param data - Optional data to log
   */
  debug(context: string, message?: string, data?: unknown): void {
    if (this.isDev) {
      if (message) {
        console.log(`[${context}] ${message}`, data !== undefined ? data : '');
      } else {
        console.log(`[${context}]`, data !== undefined ? data : '');
      }
    }
  }

  /**
   * Info-level logging
   * Use for general informational messages
   * @param context - Component or module name
   * @param message - Log message
   * @param data - Optional data to log
   */
  info(context: string, message: string, data?: unknown): void {
    console.log(`[${context}] ${message}`, data !== undefined ? data : '');
  }

  /**
   * Warning-level logging
   * Use for potentially harmful situations
   * @param context - Component or module name
   * @param message - Warning message
   * @param data - Optional data to log
   */
  warn(context: string, message: string, data?: unknown): void {
    console.warn(`[${context}] ${message}`, data !== undefined ? data : '');
  }

  /**
   * Error-level logging
   * Use for error events
   * @param context - Component or module name
   * @param error - Error object or error message
   * @param data - Optional additional data
   */
  error(context: string, error: Error | string, data?: unknown): void {
    const errorMessage = error instanceof Error ? error.message : error;
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error(`[${context}]`, errorMessage, data !== undefined ? data : '');

    if (errorStack && this.isDev) {
      console.error('Stack trace:', errorStack);
    }
  }

  /**
   * Performance timing utility
   * @param context - Component or module name
   * @param label - Label for the timing measurement
   * @returns Function to call when timing is complete
   */
  time(context: string, label: string): () => void {
    if (!this.isDev) return () => {}; // No-op in production

    const startTime = performance.now();
    return () => {
      const endTime = performance.now();
      const duration = (endTime - startTime).toFixed(2);
      this.debug(context, `${label} took ${duration}ms`);
    };
  }
}

// Export singleton instance
export const logger = new Logger();
