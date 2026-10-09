import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';
import logger from '../config/logger';

/**
 * Tenant isolation middleware.
 * Ensures tenantId is present in the JWT and attaches it to the request.
 * All downstream queries MUST use this tenantId to filter data.
 */
export const tenantResolver = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Authentication required for tenant resolution.',
    });
    return;
  }

  if (!req.user.tenantId) {
    logger.error('Tenant ID missing from JWT payload', { userId: req.user.userId });
    res.status(403).json({
      success: false,
      error: 'Tenant context not found. Please contact your administrator.',
    });
    return;
  }

  // Attach tenantId to request for easy access in controllers
  (req as any).tenantId = req.user.tenantId;

  next();
};

/**
 * Get tenant ID from request (helper for controllers/services)
 */
export const getTenantId = (req: AuthenticatedRequest): string => {
  if (!req.user?.tenantId) {
    throw new Error('Tenant ID not available. Ensure tenant middleware is applied.');
  }
  return req.user.tenantId;
};
