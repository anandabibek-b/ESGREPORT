import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

/**
 * Global error handling middleware
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error('Unhandled error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  // Don't expose internal error details in production
  const isDev = process.env.NODE_ENV === 'development';

  res.status(500).json({
    success: false,
    error: isDev ? err.message : 'An internal server error occurred.',
    ...(isDev && { stack: err.stack }),
  });
};

/**
 * 404 handler
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.url} not found.`,
  });
};
