/**
 * Error Handling Utilities
 * Centralized error handling and logging utilities
 */

export interface ErrorContext {
  component: string;
  action: string;
  additionalInfo?: Record<string, unknown>;
}

export class AppError extends Error {
  public readonly code: string;
  public readonly context?: ErrorContext;
  public readonly originalError?: Error;

  constructor(
    message: string,
    code: string = 'APP_ERROR',
    context?: ErrorContext,
    originalError?: Error
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.context = context;
    this.originalError = originalError;
    
    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Log error with context
 */
export function logError(error: Error | AppError, context?: ErrorContext): void {
  const errorData = {
    timestamp: new Date().toISOString(),
    message: error.message,
    code: error instanceof AppError ? error.code : 'UNKNOWN',
    stack: error.stack,
    context: context || (error instanceof AppError ? error.context : undefined),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    url: typeof window !== 'undefined' ? window.location.href : 'unknown',
  };

  console.error('Application Error:', errorData);

  // Store in localStorage for debugging
  if (typeof window !== 'undefined' && 'localStorage' in window) {
    try {
      const errorLog = JSON.parse(localStorage.getItem('errorLog') || '[]');
      errorLog.push(errorData);
      // Keep only last 20 errors
      if (errorLog.length > 20) {
        errorLog.shift();
      }
      localStorage.setItem('errorLog', JSON.stringify(errorLog));
    } catch (e) {
      console.error('Failed to log error to localStorage:', e);
    }
  }
}

/**
 * Wrap async function with error handling
 */
export function withErrorHandling<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  context: ErrorContext
): T {
  return (async (...args: unknown[]) => {
    try {
      return await fn(...args);
    } catch (error) {
      const appError = error instanceof AppError 
        ? error 
        : new AppError(
            error instanceof Error ? error.message : 'Unknown error',
            'UNKNOWN',
            context,
            error instanceof Error ? error : undefined
          );
      logError(appError, context);
      throw appError;
    }
  }) as T;
}

/**
 * Wrap sync function with error handling
 */
export function withSyncErrorHandling<T extends (...args: unknown[]) => unknown>(
  fn: T,
  context: ErrorContext
): T {
  return ((...args: unknown[]) => {
    try {
      return fn(...args);
    } catch (error) {
      const appError = error instanceof AppError 
        ? error 
        : new AppError(
            error instanceof Error ? error.message : 'Unknown error',
            'UNKNOWN',
            context,
            error instanceof Error ? error : undefined
          );
      logError(appError, context);
      throw appError;
    }
  }) as T;
}

/**
 * Safe JSON parse with error handling
 */
export function safeJsonParse<T>(json: string, defaultValue: T): T {
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    logError(error instanceof Error ? error : new Error('JSON parse failed'), {
      component: 'safeJsonParse',
      action: 'parse',
      additionalInfo: { json: json.substring(0, 100) },
    });
    return defaultValue;
  }
}

/**
 * Safe JSON stringify with error handling
 */
export function safeJsonStringify(obj: unknown, defaultValue: string): string {
  try {
    return JSON.stringify(obj);
  } catch (error) {
    logError(error instanceof Error ? error : new Error('JSON stringify failed'), {
      component: 'safeJsonStringify',
      action: 'stringify',
    });
    return defaultValue;
  }
}
