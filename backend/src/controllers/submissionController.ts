import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import prisma from '../config/database';
import { submissionSchema, metricValueSchema, reviewSchema } from '../validators/schemas';
import logger from '../config/logger';

export class SubmissionController {
  /**
   * Get submissions for current tenant
   */
  async getSubmissions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const tenantId = req.user!.tenantId;
      const { reportingPeriodId, orgUnitId, category, status, page = '1', limit = '20' } = req.query;

      const where: any = { tenantId };
      if (reportingPeriodId) where.reportingPeriodId = reportingPeriodId;
      if (orgUnitId) where.orgUnitId = orgUnitId;
      if (category) where.category = category;
      if (status) where.status = status;

      // Restrict Project Manager to their assigned project only (Data Ownership)
      const isProjectManager = req.user!.roles?.some((r) => r.toUpperCase() === 'PROJECT_MANAGER');
      if (isProjectManager) {
        const assignedRole = await prisma.userRole.findFirst({
          where: { userId: req.user!.userId, orgUnitId: { not: null } },
          select: { orgUnitId: true },
        });
        if (assignedRole?.orgUnitId) {
          where.orgUnitId = assignedRole.orgUnitId;
        }
      }

      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
      const take = parseInt(limit as string);

      const [submissions, total] = await Promise.all([
        prisma.submission.findMany({
          where,
          include: {
            orgUnit: { select: { id: true, name: true, type: true } },
            reportingPeriod: { select: { id: true, name: true } },
            submittedBy: { select: { id: true, firstName: true, lastName: true } },
            _count: {
              select: {
                metricValues: true,
                evidence: true,
                validationResults: true,
                reviews: true,
              },
            },
          },
          orderBy: { updatedAt: 'desc' },
          skip,
          take,
        }),
        prisma.submission.count({ where }),
      ]);

      res.json({
        success: true,
        data: submissions,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          totalPages: Math.ceil(total / take),
        },
      });
    } catch (error: any) {
      logger.error('Get submissions error:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch submissions.' });
    }
  }

  /**
   * Get single submission with all details
   */
  async getSubmission(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const submission = await prisma.submission.findFirst({
        where: { id, tenantId: req.user!.tenantId },
        include: {
          orgUnit: { include: { type: true } },
          reportingPeriod: {
            include: { frameworkVersion: true },
          },
          submittedBy: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          metricValues: {
            include: {
              question: true,
              metric: { include: { unit: true } },
            },
            orderBy: { createdAt: 'asc' },
          },
          evidence: {
            include: {
              uploadedBy: {
                select: { id: true, firstName: true, lastName: true },
              },
            },
            orderBy: { uploadedAt: 'desc' },
          },
          validationResults: {
            orderBy: { createdAt: 'desc' },
          },
          reviews: {
            include: {
              reviewer: {
                select: { id: true, firstName: true, lastName: true },
              },
            },
            orderBy: { reviewedAt: 'desc' },
          },
          approvals: {
            include: {
              approver: {
                select: { id: true, firstName: true, lastName: true },
              },
            },
            orderBy: { approvedAt: 'desc' },
          },
          comments: {
            include: {
              user: {
                select: { id: true, firstName: true, lastName: true },
              },
            },
            orderBy: { createdAt: 'asc' },
          },
          workflowTransitions: {
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      if (!submission) {
        res.status(404).json({ success: false, error: 'Submission not found.' });
        return;
      }

      // Restrict Project Manager to their assigned project only
      const isProjectManager = req.user!.roles?.some((r) => r.toUpperCase() === 'PROJECT_MANAGER');
      if (isProjectManager) {
        const assignedRole = await prisma.userRole.findFirst({
          where: { userId: req.user!.userId, orgUnitId: { not: null } },
          select: { orgUnitId: true },
        });
        if (assignedRole?.orgUnitId && submission.orgUnitId !== assignedRole.orgUnitId) {
          res.status(403).json({ success: false, error: 'You do not have permission to access data for this project.' });
          return;
        }
      }

      res.json({ success: true, data: submission });
    } catch (error: any) {
      logger.error('Get submission error:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch submission.' });
    }
  }

  /**
   * Create a new submission (draft)
   */
  async createSubmission(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const validated = submissionSchema.parse(req.body);

      const submission = await prisma.submission.create({
        data: {
          tenantId: req.user!.tenantId,
          ...validated,
          submittedById: req.user!.userId,
          status: 'draft',
        },
        include: {
          orgUnit: { include: { type: true } },
          reportingPeriod: true,
        },
      });

      await prisma.auditLog.create({
        data: {
          tenantId: req.user!.tenantId,
          userId: req.user!.userId,
          action: 'create',
          entityType: 'submission',
          entityId: submission.id,
          newValue: JSON.stringify(validated),
        },
      });

      res.status(201).json({ success: true, data: submission });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ success: false, error: 'Validation failed.', details: error.errors });
        return;
      }
      logger.error('Create submission error:', error);
      res.status(500).json({ success: false, error: 'Failed to create submission.' });
    }
  }

  /**
   * Save metric values to a submission
   */
  async saveMetricValues(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { values } = req.body; // array of metric values

      const submission = await prisma.submission.findFirst({
        where: { id, tenantId: req.user!.tenantId },
      });

      if (!submission) {
        res.status(404).json({ success: false, error: 'Submission not found.' });
        return;
      }

      // Role check: ESG Team cannot modify original submitted data directly
      const isEsgTeam = req.user!.roles?.some((r) => r.toUpperCase() === 'ESG_TEAM');
      if (isEsgTeam) {
        res.status(403).json({
          success: false,
          error: 'ESG Team cannot modify original submitted data directly. Please use the review workflow to request corrections or approve.',
        });
        return;
      }

      // Data ownership: Project Manager can only edit their assigned project
      const isProjectManager = req.user!.roles?.some((r) => r.toUpperCase() === 'PROJECT_MANAGER');
      if (isProjectManager) {
        const assignedRole = await prisma.userRole.findFirst({
          where: { userId: req.user!.userId, orgUnitId: { not: null } },
          select: { orgUnitId: true },
        });
        if (assignedRole?.orgUnitId && submission.orgUnitId !== assignedRole.orgUnitId) {
          res.status(403).json({ success: false, error: 'You do not have permission to modify data for this project.' });
          return;
        }
      }

      if (!['draft', 'changes_requested'].includes(submission.status)) {
        res.status(400).json({
          success: false,
          error: submission.status === 'approved' || submission.status === 'consolidated'
            ? 'Cannot modify approved or consolidated submissions.'
            : `Can only edit submissions in draft or changes_requested status (current: ${submission.status}).`,
        });
        return;
      }

      // Upsert metric values with versioning history
      const savedValues: any[] = [];
      for (const value of (values as any[])) {
        const data = {
          tenantId: req.user!.tenantId,
          submissionId: id,
          questionId: value.questionId || null,
          metricId: value.metricId || null,
          numericValue: value.numericValue !== undefined && value.numericValue !== null ? parseFloat(value.numericValue) : null,
          textValue: value.textValue ?? null,
          booleanValue: value.booleanValue ?? null,
          dateValue: value.dateValue ? new Date(value.dateValue) : null,
          jsonValue: value.jsonValue ?? null,
          unit: value.unit || null,
          notes: value.notes || null,
          isEstimated: value.isEstimated || false,
          dataSource: value.dataSource || null,
          createdBy: req.user!.userId,
        };

        if (value.id) {
          const existing = await prisma.metricValue.findUnique({ where: { id: value.id } });
          const updated = await prisma.metricValue.update({
            where: { id: value.id },
            data,
          });

          // Create version snapshot if value changed (Phase 16)
          if (existing && (existing.numericValue !== updated.numericValue || existing.textValue !== updated.textValue)) {
            const count = await prisma.metricValueVersion.count({ where: { metricValueId: value.id } });
            await prisma.metricValueVersion.create({
              data: {
                tenantId: req.user!.tenantId,
                metricValueId: value.id,
                versionNumber: count + 1,
                numericValue: updated.numericValue,
                textValue: updated.textValue,
                unit: updated.unit,
                reason: value.changeReason || 'Operational value update',
                changedById: req.user!.userId,
              },
            });
          }
          savedValues.push(updated);
        } else {
          const created = await prisma.metricValue.create({ data });
          savedValues.push(created);
        }
      }

      res.json({ success: true, data: savedValues });
    } catch (error: any) {
      logger.error('Save metric values error:', error);
      res.status(500).json({ success: false, error: 'Failed to save metric values.' });
    }
  }

  /**
   * Submit for review (transition from draft → submitted)
   */
  async submitForReview(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const submission = await prisma.submission.findFirst({
        where: { id, tenantId: req.user!.tenantId },
      });

      if (!submission) {
        res.status(404).json({ success: false, error: 'Submission not found.' });
        return;
      }

      // Data ownership check for submission
      const isProjectManager = req.user!.roles?.some((r) => r.toUpperCase() === 'PROJECT_MANAGER');
      if (isProjectManager) {
        const assignedRole = await prisma.userRole.findFirst({
          where: { userId: req.user!.userId, orgUnitId: { not: null } },
          select: { orgUnitId: true },
        });
        if (assignedRole?.orgUnitId && submission.orgUnitId !== assignedRole.orgUnitId) {
          res.status(403).json({ success: false, error: 'You do not have permission to submit data for this project.' });
          return;
        }
      }

      if (!['draft', 'changes_requested'].includes(submission.status)) {
        res.status(400).json({
          success: false,
          error: `Cannot submit from status '${submission.status}'.`,
        });
        return;
      }

      await prisma.$transaction([
        prisma.submission.update({
          where: { id },
          data: {
            status: 'submitted',
            submittedAt: new Date(),
            submittedById: req.user!.userId,
          },
        }),
        prisma.workflowTransition.create({
          data: {
            tenantId: req.user!.tenantId,
            submissionId: id,
            fromStatus: submission.status,
            toStatus: 'submitted',
            userId: req.user!.userId,
            comment: req.body.comment || null,
          },
        }),
        prisma.auditLog.create({
          data: {
            tenantId: req.user!.tenantId,
            userId: req.user!.userId,
            action: 'submit',
            entityType: 'submission',
            entityId: id,
            oldValue: JSON.stringify({ status: submission.status }),
            newValue: JSON.stringify({ status: 'submitted' }),
          },
        }),
      ]);

      res.json({ success: true, message: 'Submission submitted for review.' });
    } catch (error: any) {
      logger.error('Submit for review error:', error);
      res.status(500).json({ success: false, error: 'Failed to submit.' });
    }
  }

  /**
   * Review a submission
   */
  async reviewSubmission(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const isProjectManager = req.user!.roles?.some((r) => r.toUpperCase() === 'PROJECT_MANAGER');
      if (isProjectManager) {
        res.status(403).json({ success: false, error: 'Project Managers are not permitted to review or approve submissions.' });
        return;
      }

      const { id } = req.params;
      const validated = reviewSchema.parse({ ...req.body, submissionId: id });

      const submission = await prisma.submission.findFirst({
        where: { id, tenantId: req.user!.tenantId },
      });

      if (!submission) {
        res.status(404).json({ success: false, error: 'Submission not found.' });
        return;
      }

      if (!['submitted', 'under_review'].includes(submission.status)) {
        res.status(400).json({
          success: false,
          error: `Cannot review submission in '${submission.status}' status.`,
        });
        return;
      }

      // Check for blocking errors if reviewer approves
      if (validated.status === 'approved') {
        const blockingErrors = await prisma.validationResult.count({
          where: {
            submissionId: id,
            tenantId: req.user!.tenantId,
            severity: 'error',
            isResolved: false,
          },
        });
        if (blockingErrors > 0) {
          res.status(400).json({
            success: false,
            error: `Cannot approve submission. There are ${blockingErrors} unresolved blocking validation error(s). Please review and resolve all errors first.`,
          });
          return;
        }
      }

      const newStatus =
        validated.status === 'approved'
          ? 'approved'
          : validated.status === 'changes_requested'
          ? 'changes_requested'
          : 'rejected';

      await prisma.$transaction([
        prisma.review.create({
          data: {
            tenantId: req.user!.tenantId,
            submissionId: id,
            reviewerId: req.user!.userId,
            status: validated.status,
            comments: validated.comments,
          },
        }),
        prisma.submission.update({
          where: { id },
          data: { status: newStatus },
        }),
        prisma.workflowTransition.create({
          data: {
            tenantId: req.user!.tenantId,
            submissionId: id,
            fromStatus: submission.status,
            toStatus: newStatus,
            userId: req.user!.userId,
            comment: validated.comments,
          },
        }),
        prisma.auditLog.create({
          data: {
            tenantId: req.user!.tenantId,
            userId: req.user!.userId,
            action: 'review',
            entityType: 'submission',
            entityId: id,
            oldValue: JSON.stringify({ status: submission.status }),
            newValue: JSON.stringify({ status: newStatus, reviewComments: validated.comments }),
          },
        }),
      ]);

      res.json({ success: true, message: `Submission ${newStatus}.` });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ success: false, error: 'Validation failed.', details: error.errors });
        return;
      }
      logger.error('Review submission error:', error);
      res.status(500).json({ success: false, error: 'Failed to review submission.' });
    }
  }

  /**
   * Approve a submission (final approval)
   */
  async approveSubmission(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const isProjectManager = req.user!.roles?.some((r) => r.toUpperCase() === 'PROJECT_MANAGER');
      if (isProjectManager) {
        res.status(403).json({ success: false, error: 'Project Managers are not permitted to approve submissions.' });
        return;
      }

      const { id } = req.params;
      const { comments } = req.body;

      const submission = await prisma.submission.findFirst({
        where: { id, tenantId: req.user!.tenantId },
      });

      if (!submission) {
        res.status(404).json({ success: false, error: 'Submission not found.' });
        return;
      }

      if (submission.status !== 'approved') {
        res.status(400).json({
          success: false,
          error: 'Submission must be reviewed before final approval.',
        });
        return;
      }

      // Check for blocking errors before final approval
      const blockingErrors = await prisma.validationResult.count({
        where: {
          submissionId: id,
          tenantId: req.user!.tenantId,
          severity: 'error',
          isResolved: false,
        },
      });
      if (blockingErrors > 0) {
        res.status(400).json({
          success: false,
          error: `Cannot approve submission. There are ${blockingErrors} unresolved blocking validation error(s).`,
        });
        return;
      }

      await prisma.$transaction([
        prisma.approval.create({
          data: {
            tenantId: req.user!.tenantId,
            submissionId: id,
            approverId: req.user!.userId,
            status: 'approved',
            comments,
          },
        }),
        prisma.submission.update({
          where: { id },
          data: { status: 'consolidated' },
        }),
        prisma.workflowTransition.create({
          data: {
            tenantId: req.user!.tenantId,
            submissionId: id,
            fromStatus: 'approved',
            toStatus: 'consolidated',
            userId: req.user!.userId,
            comment: comments,
          },
        }),
        prisma.auditLog.create({
          data: {
            tenantId: req.user!.tenantId,
            userId: req.user!.userId,
            action: 'approve',
            entityType: 'submission',
            entityId: id,
            newValue: JSON.stringify({ status: 'consolidated', approverComments: comments }),
          },
        }),
      ]);

      res.json({ success: true, message: 'Submission approved and ready for consolidation.' });
    } catch (error: any) {
      logger.error('Approve submission error:', error);
      res.status(500).json({ success: false, error: 'Failed to approve submission.' });
    }
  }

  /**
   * Reject a submission
   */
  async rejectSubmission(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const isProjectManager = req.user!.roles?.some((r) => r.toUpperCase() === 'PROJECT_MANAGER');
      if (isProjectManager) {
        res.status(403).json({ success: false, error: 'Project Managers are not permitted to reject submissions.' });
        return;
      }

      const { id } = req.params;
      const { comments } = req.body;

      const submission = await prisma.submission.findFirst({
        where: { id, tenantId: req.user!.tenantId },
      });

      if (!submission) {
        res.status(404).json({ success: false, error: 'Submission not found.' });
        return;
      }

      await prisma.$transaction([
        prisma.submission.update({
          where: { id },
          data: { status: 'rejected' },
        }),
        prisma.workflowTransition.create({
          data: {
            tenantId: req.user!.tenantId,
            submissionId: id,
            fromStatus: submission.status,
            toStatus: 'rejected',
            userId: req.user!.userId,
            comment: comments,
          },
        }),
        prisma.auditLog.create({
          data: {
            tenantId: req.user!.tenantId,
            userId: req.user!.userId,
            action: 'reject',
            entityType: 'submission',
            entityId: id,
            newValue: JSON.stringify({ status: 'rejected', comments }),
          },
        }),
      ]);

      res.json({ success: true, message: 'Submission rejected.' });
    } catch (error: any) {
      logger.error('Reject submission error:', error);
      res.status(500).json({ success: false, error: 'Failed to reject submission.' });
    }
  }
}

export const submissionController = new SubmissionController();
