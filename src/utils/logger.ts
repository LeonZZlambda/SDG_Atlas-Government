/**
 * Logging utility for production-ready error handling
 * Replaces console statements with proper logging service
 */

export class Logger {
  private static isDev = import.meta.env.DEV;

  static error(message: string, error?: unknown, context?: Record<string, unknown>) {
    if (this.isDev) {
      console.error(message, error, context);
    }
    // TODO: Send to error tracking service (e.g., Sentry, LogRocket)
  }

  static warn(message: string, context?: Record<string, unknown>) {
    if (this.isDev) {
      console.warn(message, context);
    }
    // TODO: Send to monitoring service
  }

  static info(message: string, context?: Record<string, unknown>) {
    if (this.isDev) {
      console.info(message, context);
    }
  }

  static debug(message: string, context?: Record<string, unknown>) {
    if (this.isDev) {
      console.debug(message, context);
    }
  }
}
