import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import prisma from '../config/database';
import logger from '../config/logger';

export class FrameworkController {
  /**
   * Get all frameworks
   */
  async getFrameworks(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const frameworks = await prisma.framework.findMany({
        include: {
          versions: {
            orderBy: { effectiveFrom: 'desc' },
          },
        },
        orderBy: { name: 'asc' },
      });

      res.json({ success: true, data: frameworks });
    } catch (error: any) {
      logger.error('Get frameworks error:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch frameworks.' });
    }
  }

  /**
   * Get framework version with full structure
   */
  async getFrameworkVersion(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const version = await prisma.frameworkVersion.findUnique({
        where: { id },
        include: {
          framework: true,
          sections: {
            orderBy: { sortOrder: 'asc' },
            include: {
              principles: {
                orderBy: { sortOrder: 'asc' },
                include: {
                  indicators: {
                    orderBy: { sortOrder: 'asc' },
                    include: {
                      questions: {
                        orderBy: { sortOrder: 'asc' },
                        include: {
                          metrics: {
                            include: { unit: true },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!version) {
        res.status(404).json({ success: false, error: 'Framework version not found.' });
        return;
      }

      res.json({ success: true, data: version });
    } catch (error: any) {
      logger.error('Get framework version error:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch framework version.' });
    }
  }

  /**
   * Get questions for a specific section/principle/indicator
   */
  async getQuestions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { frameworkVersionId, sectionCode, principleCode, indicatorCode, isBrsrCore } = req.query;

      const where: any = {};

      if (indicatorCode || principleCode || sectionCode || frameworkVersionId) {
        where.indicator = {};

        if (indicatorCode) {
          where.indicator.code = indicatorCode;
        }

        if (principleCode) {
          where.indicator.principle = { code: principleCode };
        }

        if (sectionCode) {
          where.indicator = {
            ...where.indicator,
            principle: {
              ...(where.indicator.principle || {}),
              section: { code: sectionCode },
            },
          };
        }

        if (frameworkVersionId) {
          where.indicator = {
            ...where.indicator,
            principle: {
              ...(where.indicator.principle || {}),
              section: {
                ...(where.indicator.principle?.section || {}),
                frameworkVersionId,
              },
            },
          };
        }
      }

      if (isBrsrCore === 'true') {
        where.isBrsrCore = true;
      }

      const questions = await prisma.question.findMany({
        where,
        include: {
          indicator: {
            include: {
              principle: {
                include: {
                  section: true,
                },
              },
            },
          },
          metrics: {
            include: { unit: true },
          },
          validationRules: {
            include: { validationRule: true },
          },
        },
        orderBy: { sortOrder: 'asc' },
      });

      res.json({ success: true, data: questions });
    } catch (error: any) {
      logger.error('Get questions error:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch questions.' });
    }
  }

  /**
   * Get all metrics
   */
  async getMetrics(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { category, isBrsrCore } = req.query;

      const where: any = {};
      if (category) where.category = category;
      if (isBrsrCore === 'true') where.isBrsrCore = true;

      const metrics = await prisma.metric.findMany({
        where,
        include: {
          unit: true,
          question: {
            select: { id: true, code: true, text: true },
          },
        },
        orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
      });

      res.json({ success: true, data: metrics });
    } catch (error: any) {
      logger.error('Get metrics error:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch metrics.' });
    }
  }

  /**
   * Get BRSR Core metrics and readiness
   */
  async getBrsrCore(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const tenantId = req.user!.tenantId;
      const { reportingPeriodId } = req.query;

      // Get all BRSR Core questions
      const coreQuestions = await prisma.question.findMany({
        where: { isBrsrCore: true },
        include: {
          indicator: {
            include: {
              principle: {
                include: { section: true },
              },
            },
          },
          metrics: { include: { unit: true } },
        },
        orderBy: { sortOrder: 'asc' },
      });

      // Get metric values for these questions
      const metricValues = reportingPeriodId
        ? await prisma.metricValue.findMany({
            where: {
              tenantId,
              submission: {
                reportingPeriodId: reportingPeriodId as string,
              },
              questionId: {
                in: coreQuestions.map((q) => q.id),
              },
            },
            include: {
              submission: {
                select: { status: true, orgUnit: { select: { name: true } } },
              },
            },
          })
        : [];

      // Calculate readiness
      const totalMetrics = coreQuestions.length;
      const completedIds = new Set(metricValues.filter((mv) => mv.numericValue !== null || mv.textValue !== null).map((mv) => mv.questionId));
      const approvedIds = new Set(
        metricValues
          .filter((mv) => mv.submission.status === 'approved' || mv.submission.status === 'consolidated')
          .map((mv) => mv.questionId)
      );
      const reviewIds = new Set(
        metricValues
          .filter((mv) => mv.submission.status === 'under_review')
          .map((mv) => mv.questionId)
      );

      const readiness = {
        total: totalMetrics,
        completed: completedIds.size,
        missing: totalMetrics - completedIds.size,
        approved: approvedIds.size,
        underReview: reviewIds.size,
        validated: 0, // TODO: cross-reference with validation results
        evidenceAvailable: 0, // TODO: count evidence
        evidenceMissing: 0,
      };

      res.json({
        success: true,
        data: {
          questions: coreQuestions,
          values: metricValues,
          readiness,
        },
      });
    } catch (error: any) {
      logger.error('Get BRSR Core error:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch BRSR Core data.' });
    }
  }
}

export const frameworkController = new FrameworkController();
