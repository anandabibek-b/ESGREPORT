import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';
import prisma from '../config/database';
import logger from '../config/logger';

/**
 * RBAC middleware factory.
 * Checks if the authenticated user has the required permission for a given module.
 * 
 * Usage:
 *   router.get('/submissions', authenticate, tenantResolver, authorize('view', 'submissions'), controller)
 */
export const authorize = (permission: string, module: string) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required.',
        });
        return;
      }

      // Platform Super Admin bypasses all checks
      if (req.user.roles.includes('platform_super_admin')) {
        next();
        return;
      }

      // Check if user has the required permission through their roles
      const userPermissions = await prisma.rolePermission.findMany({
        where: {
          role: {
            userRoles: {
              some: {
                userId: req.user.userId,
              },
            },
          },
          permission: {
            name: permission,
            module: module,
          },
        },
        include: {
          permission: true,
          role: true,
        },
      });

      if (userPermissions.length === 0) {
        logger.warn('Authorization denied', {
          userId: req.user.userId,
          tenantId: req.user.tenantId,
          permission,
          module,
        });

        res.status(403).json({
          success: false,
          error: `You do not have permission to ${permission} ${module}. Contact your administrator.`,
        });
        return;
      }

      next();
    } catch (error) {
      logger.error('Authorization error:', error);
      res.status(500).json({
        success: false,
        error: 'Authorization check failed.',
      });
    }
  };
};

/**
 * Checks if user has ANY of the specified roles
 */
export const requireRole = (...roles: string[]) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required.',
      });
      return;
    }

    const hasRole = req.user.roles.some((role) => roles.includes(role));

    if (!hasRole) {
      res.status(403).json({
        success: false,
        error: 'Insufficient role privileges.',
      });
      return;
    }

    next();
  };
};
