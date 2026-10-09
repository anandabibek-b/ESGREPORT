import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import prisma from '../config/database';
import { companyInfoSchema, orgUnitSchema, reportingPeriodSchema } from '../validators/schemas';
import logger from '../config/logger';

export class CompanyController {
  /**
   * Get company details for current tenant
   */
  async getCompany(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const company = await prisma.company.findFirst({
        where: { tenantId: req.user!.tenantId },
        include: {
          orgUnits: {
            include: {
              type: true,
              parent: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      if (!company) {
        res.status(404).json({ success: false, error: 'Company not found.' });
        return;
      }

      res.json({ success: true, data: company });
    } catch (error: any) {
      logger.error('Get company error:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch company.' });
    }
  }

  /**
   * Update company information (onboarding Step 1)
   */
  async updateCompany(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const validated = companyInfoSchema.parse(req.body);

      const company = await prisma.company.findFirst({
        where: { tenantId: req.user!.tenantId },
      });

      if (!company) {
        res.status(404).json({ success: false, error: 'Company not found.' });
        return;
      }

      const oldValue = { ...company };

      const updated = await prisma.company.update({
        where: { id: company.id },
        data: {
          ...validated,
        },
      });

      // Audit log
      await prisma.auditLog.create({
        data: {
          tenantId: req.user!.tenantId,
          userId: req.user!.userId,
          action: 'update',
          entityType: 'company',
          entityId: company.id,
          oldValue: JSON.stringify(oldValue),
          newValue: JSON.stringify(validated),
        },
      });

      res.json({ success: true, data: updated });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ success: false, error: 'Validation failed.', details: error.errors });
        return;
      }
      logger.error('Update company error:', error);
      res.status(500).json({ success: false, error: 'Failed to update company.' });
    }
  }

  /**
   * Complete onboarding
   */
  async completeOnboarding(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const company = await prisma.company.findFirst({
        where: { tenantId: req.user!.tenantId },
      });

      if (!company) {
        res.status(404).json({ success: false, error: 'Company not found.' });
        return;
      }

      await prisma.company.update({
        where: { id: company.id },
        data: { onboardingCompleted: true },
      });

      await prisma.auditLog.create({
        data: {
          tenantId: req.user!.tenantId,
          userId: req.user!.userId,
          action: 'update',
          entityType: 'company',
          entityId: company.id,
          newValue: JSON.stringify({ onboardingCompleted: true }),
        },
      });

      res.json({ success: true, message: 'Onboarding completed.' });
    } catch (error: any) {
      logger.error('Complete onboarding error:', error);
      res.status(500).json({ success: false, error: 'Failed to complete onboarding.' });
    }
  }
}

export class OrgUnitController {
  /**
   * Get all org units for current tenant (tree structure)
   */
  async getOrgUnits(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const isProjectManager = req.user!.roles?.some((r) => r.toUpperCase() === 'PROJECT_MANAGER');
      let whereClause: any = { tenantId: req.user!.tenantId };

      if (isProjectManager) {
        const assignedRole = await prisma.userRole.findFirst({
          where: { userId: req.user!.userId, orgUnitId: { not: null } },
          select: { orgUnitId: true },
        });
        if (assignedRole?.orgUnitId) {
          whereClause = { tenantId: req.user!.tenantId, id: assignedRole.orgUnitId };
        }
      }

      const orgUnits = await prisma.orgUnit.findMany({
        where: whereClause,
        include: {
          type: true,
          parent: { select: { id: true, name: true } },
          children: {
            select: { id: true, name: true },
          },
        },
        orderBy: [{ type: { level: 'asc' } }, { name: 'asc' }],
      });

      res.json({ success: true, data: orgUnits });
    } catch (error: any) {
      logger.error('Get org units error:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch org units.' });
    }
  }

  /**
   * Get org unit types for tenant
   */
  async getOrgUnitTypes(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const types = await prisma.orgUnitType.findMany({
        where: { tenantId: req.user!.tenantId },
        orderBy: { level: 'asc' },
      });

      res.json({ success: true, data: types });
    } catch (error: any) {
      logger.error('Get org unit types error:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch org unit types.' });
    }
  }

  /**
   * Create org unit
   */
  async createOrgUnit(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const validated = orgUnitSchema.parse(req.body);

      const orgUnit = await prisma.orgUnit.create({
        data: {
          tenantId: req.user!.tenantId,
          ...validated,
          createdBy: req.user!.userId,
        },
        include: {
          type: true,
          parent: { select: { id: true, name: true } },
        },
      });

      await prisma.auditLog.create({
        data: {
          tenantId: req.user!.tenantId,
          userId: req.user!.userId,
          action: 'create',
          entityType: 'org_unit',
          entityId: orgUnit.id,
          newValue: JSON.stringify(validated),
        },
      });

      res.status(201).json({ success: true, data: orgUnit });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ success: false, error: 'Validation failed.', details: error.errors });
        return;
      }
      logger.error('Create org unit error:', error);
      res.status(500).json({ success: false, error: 'Failed to create org unit.' });
    }
  }

  /**
   * Update org unit
   */
  async updateOrgUnit(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const existing = await prisma.orgUnit.findFirst({
        where: { id, tenantId: req.user!.tenantId },
      });

      if (!existing) {
        res.status(404).json({ success: false, error: 'Org unit not found.' });
        return;
      }

      const updated = await prisma.orgUnit.update({
        where: { id },
        data: {
          name: req.body.name,
          code: req.body.code,
          address: req.body.address,
          city: req.body.city,
          state: req.body.state,
          country: req.body.country,
          pincode: req.body.pincode,
          metadata: req.body.metadata,
        },
        include: { type: true },
      });

      res.json({ success: true, data: updated });
    } catch (error: any) {
      logger.error('Update org unit error:', error);
      res.status(500).json({ success: false, error: 'Failed to update org unit.' });
    }
  }

  /**
   * Delete org unit (soft: set status to archived)
   */
  async deleteOrgUnit(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const existing = await prisma.orgUnit.findFirst({
        where: { id, tenantId: req.user!.tenantId },
      });

      if (!existing) {
        res.status(404).json({ success: false, error: 'Org unit not found.' });
        return;
      }

      // Check for children
      const children = await prisma.orgUnit.count({
        where: { parentId: id, tenantId: req.user!.tenantId },
      });

      if (children > 0) {
        res.status(400).json({
          success: false,
          error: 'Cannot delete org unit with children. Remove children first.',
        });
        return;
      }

      await prisma.orgUnit.update({
        where: { id },
        data: { status: 'archived' },
      });

      await prisma.auditLog.create({
        data: {
          tenantId: req.user!.tenantId,
          userId: req.user!.userId,
          action: 'delete',
          entityType: 'org_unit',
          entityId: id,
          oldValue: JSON.stringify(existing),
        },
      });

      res.json({ success: true, message: 'Org unit archived.' });
    } catch (error: any) {
      logger.error('Delete org unit error:', error);
      res.status(500).json({ success: false, error: 'Failed to delete org unit.' });
    }
  }
}

export const companyController = new CompanyController();
export const orgUnitController = new OrgUnitController();
