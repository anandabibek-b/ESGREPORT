import { Request, Response } from 'express';
import { authService } from '../services/authService';
import { registerSchema, loginSchema, refreshTokenSchema } from '../validators/schemas';
import logger from '../config/logger';

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const validated = registerSchema.parse(req.body);
      const result = await authService.register(validated);

      res.status(201).json({
        success: true,
        message: 'Registration successful.',
        data: result,
      });
    } catch (error: any) {
      logger.error('Registration error:', error);

      if (error.name === 'ZodError') {
        res.status(400).json({
          success: false,
          error: 'Validation failed.',
          details: error.errors,
        });
        return;
      }

      res.status(400).json({
        success: false,
        error: error.message || 'Registration failed.',
      });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const validated = loginSchema.parse(req.body);
      const result = await authService.login(validated);

      res.status(200).json({
        success: true,
        message: 'Login successful.',
        data: result,
      });
    } catch (error: any) {
      logger.error('Login error:', error);

      if (error.name === 'ZodError') {
        res.status(400).json({
          success: false,
          error: 'Validation failed.',
          details: error.errors,
        });
        return;
      }

      res.status(401).json({
        success: false,
        error: error.message || 'Login failed.',
      });
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = refreshTokenSchema.parse(req.body);
      const tokens = await authService.refreshToken(refreshToken);

      res.status(200).json({
        success: true,
        data: tokens,
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        error: error.message || 'Token refresh failed.',
      });
    }
  }

  async me(req: any, res: Response): Promise<void> {
    try {
      const user = req.user;
      if (!user) {
        res.status(401).json({ success: false, error: 'Not authenticated.' });
        return;
      }

      // Get full user data
      const { default: prisma } = await import('../config/database');
      const fullUser = await prisma.user.findFirst({
        where: {
          id: user.userId,
          tenantId: user.tenantId,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          designation: true,
          department: true,
          avatarUrl: true,
          status: true,
          lastLoginAt: true,
          createdAt: true,
          tenant: {
            select: { id: true, name: true },
          },
          userRoles: {
            include: {
              role: {
                select: { name: true, displayName: true },
              },
            },
          },
        },
      });

      if (!fullUser) {
        res.status(404).json({ success: false, error: 'User not found.' });
        return;
      }

      // Get company
      const company = await prisma.company.findFirst({
        where: { tenantId: user.tenantId },
        select: {
          id: true,
          legalName: true,
          tradeName: true,
          onboardingCompleted: true,
          logoUrl: true,
        },
      });

      // Get assigned org unit if any
      let assignedOrgUnit: string | undefined = undefined;
      const assignedRoleWithOrg = fullUser.userRoles.find((ur) => ur.orgUnitId);
      if (assignedRoleWithOrg?.orgUnitId) {
        const org = await prisma.orgUnit.findUnique({
          where: { id: assignedRoleWithOrg.orgUnitId },
          select: { code: true },
        });
        assignedOrgUnit = org?.code || assignedRoleWithOrg.orgUnitId;
      }

      res.status(200).json({
        success: true,
        data: {
          ...fullUser,
          company,
          roles: fullUser.userRoles.map((ur) => ur.role),
          assignedOrgUnit,
        },
      });
    } catch (error: any) {
      logger.error('Get user profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user profile.',
      });
    }
  }

  async requestPasswordReset(req: Request, res: Response): Promise<void> {
    try {
      const { identifier, method, phoneToConnect } = req.body;
      if (!identifier || typeof identifier !== 'string') {
        res.status(400).json({ success: false, error: 'Please enter your registered phone number or email.' });
        return;
      }

      const result = await authService.requestPasswordReset({
        identifier,
        method: method || 'phone',
        phoneToConnect,
      });

      res.status(200).json(result);
    } catch (error: any) {
      logger.error('Request password reset error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Unable to request password reset code.',
      });
    }
  }

  async verifyResetOtp(req: Request, res: Response): Promise<void> {
    try {
      const { identifier, otpCode } = req.body;
      if (!identifier || !otpCode) {
        res.status(400).json({ success: false, error: 'Identifier and 6-digit OTP code are required.' });
        return;
      }

      const result = await authService.verifyResetOtp({ identifier, otpCode });
      res.status(200).json(result);
    } catch (error: any) {
      logger.error('Verify OTP error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Verification failed.',
      });
    }
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { identifier, otpCode, newPassword, phoneToConnect } = req.body;
      if (!identifier || !otpCode || !newPassword) {
        res.status(400).json({
          success: false,
          error: 'Identifier, 6-digit OTP code, and new password are required.',
        });
        return;
      }

      const result = await authService.resetPassword({
        identifier,
        otpCode,
        newPassword,
        phoneToConnect,
      });

      res.status(200).json(result);
    } catch (error: any) {
      logger.error('Reset password error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Password reset failed.',
      });
    }
  }

  async connectPhone(req: any, res: Response): Promise<void> {
    try {
      const user = req.user;
      if (!user) {
        res.status(401).json({ success: false, error: 'Not authenticated.' });
        return;
      }

      const { phone } = req.body;
      if (!phone) {
        res.status(400).json({ success: false, error: 'Mobile phone number is required.' });
        return;
      }

      const result = await authService.connectPhone(user.userId, user.tenantId, phone);
      res.status(200).json(result);
    } catch (error: any) {
      logger.error('Connect phone error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to connect phone number.',
      });
    }
  }
}

export const authController = new AuthController();
