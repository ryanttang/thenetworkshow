import { env } from './env';

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  service: string;
  userId?: string;
  requestId?: string;
  metadata?: Record<string, any>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class Logger {
  private service: string;
  private isDevelopment: boolean;

  constructor(service: string = 'thc-members') {
    this.service = service;
    this.isDevelopment = env.NODE_ENV === 'development';
  }

  private formatLog(level: LogLevel, message: string, metadata?: Record<string, any>, error?: Error): LogEntry {
    const logEntry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      service: this.service,
      metadata,
    };

    if (error) {
      logEntry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    return logEntry;
  }

  private output(level: LogLevel, message: string, metadata?: Record<string, any>, error?: Error): void {
    const logEntry = this.formatLog(level, message, metadata, error);

    if (this.isDevelopment) {
      // Pretty print for development
      const color = this.getColor(level);
      const prefix = `[${logEntry.timestamp}] ${level.toUpperCase()}`;
      console.log(`\x1b[${color}m${prefix}\x1b[0m ${message}`);
      
      if (metadata) {
        console.log('  Metadata:', JSON.stringify(metadata, null, 2));
      }
      
      if (error) {
        console.error('  Error:', error.message);
        if (error.stack) {
          console.error('  Stack:', error.stack);
        }
      }
    } else {
      // JSON output for production
      console.log(JSON.stringify(logEntry));
    }
  }

  private getColor(level: LogLevel): number {
    switch (level) {
      case LogLevel.ERROR: return 31; // Red
      case LogLevel.WARN: return 33;  // Yellow
      case LogLevel.INFO: return 36;  // Cyan
      case LogLevel.DEBUG: return 90; // Gray
      default: return 37; // White
    }
  }

  error(message: string, error?: Error, metadata?: Record<string, any>): void {
    this.output(LogLevel.ERROR, message, metadata, error);
  }

  warn(message: string, metadata?: Record<string, any>): void {
    this.output(LogLevel.WARN, message, metadata);
  }

  info(message: string, metadata?: Record<string, any>): void {
    this.output(LogLevel.INFO, message, metadata);
  }

  debug(message: string, metadata?: Record<string, any>): void {
    if (this.isDevelopment) {
      this.output(LogLevel.DEBUG, message, metadata);
    }
  }

  // Request logging
  logRequest(method: string, url: string, statusCode: number, duration: number, userId?: string): void {
    this.info('Request completed', {
      method,
      url,
      statusCode,
      duration: `${duration}ms`,
      userId,
    });
  }

  // Authentication logging
  logAuth(action: string, userId?: string, success: boolean = true, metadata?: Record<string, any>): void {
    const level = success ? LogLevel.INFO : LogLevel.WARN;
    this.output(level, `Auth ${action}`, {
      userId,
      success,
      ...metadata,
    });
  }

  // Database logging
  logDatabase(operation: string, table: string, duration: number, error?: Error): void {
    if (error) {
      this.error(`Database ${operation} failed`, error, { table, duration: `${duration}ms` });
    } else {
      this.debug(`Database ${operation} completed`, { table, duration: `${duration}ms` });
    }
  }

  // File upload logging
  logUpload(filename: string, size: number, success: boolean, error?: Error): void {
    if (error) {
      this.error('File upload failed', error, { filename, size });
    } else {
      this.info('File upload completed', { filename, size });
    }
  }
}

// Create default logger instance
export const logger = new Logger();

// Create logger for specific services
export function createLogger(service: string): Logger {
  return new Logger(service);
}

// Error tracking integration (Sentry)
export function trackError(error: Error, context?: Record<string, any>): void {
  logger.error('Error tracked', error, context);
  
  // TODO: Integrate with Sentry when available
  if (env.SENTRY_DSN) {
    // Sentry.captureException(error, { extra: context });
  }
}

// Performance monitoring
export function trackPerformance(operation: string, duration: number, metadata?: Record<string, any>): void {
  if (duration > 1000) { // Log slow operations
    logger.warn(`Slow operation: ${operation}`, { duration: `${duration}ms`, ...metadata });
  } else {
    logger.debug(`Operation completed: ${operation}`, { duration: `${duration}ms`, ...metadata });
  }
}
