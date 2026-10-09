import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import logger from '../config/logger';

export interface JwtPayload {
  userId: string;
  tenantId: string;
  email: string;
  roles: string[];
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'Authentication required. Please provide a valid token.',
      });
      return;
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
    req.user = decoded;

    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        error: 'Token expired. Please refresh your token.',
      });
      return;
    }

    if (error.name === 'JsonWebTokenError') {
      res.status(401).json({
        success: false,
        error: 'Invalid token.',
      });
      return;
    }

    logger.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication failed.',
    });
  }
};

export const optionalAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
      req.user = decoded;
    }
    next();
  } catch {
    next();
  }
};
