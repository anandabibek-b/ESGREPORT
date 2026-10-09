import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { tenantResolver } from '../middleware/tenant';
import { validationEngine } from '../services/validationService';
import prisma from '../config/database';
import logger from '../config/logger';

const router = Router();
router.use(authenticate, tenantResolver);

/**
 * Run validation suite for a submission
 */
router.post('/run/:submissionId', async (req: any, res) => {
  try {
    const { submissionId } = req.params;
    const summary = await validationEngine.validateSubmission(req.user!.tenantId, submissionId);

    // Audit log
    await prisma.auditLog.create({
      data: {
        tenantId: req.user!.tenantId,
        userId: req.user!.userId,
        action: 'validate',
        entityType: 'submission',
        entityId: submissionId,
        newValue: JSON.stringify({ pass: summary.pass, warning: summary.warning, error: summary.error }),
      },
    });

    res.json({ success: true, data: summary });
  } catch (error: any) {
    logger.error('Run validation error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to execute validation rules.' });
  }
});

/**
 * Get all validation results across tenant or by submission
 */
router.get('/', async (req: any, res) => {
  try {
    const tenantId = req.user!.tenantId;
    const { submissionId, severity, isResolved } = req.query;

    const where: any = { tenantId };
    if (submissionId) where.submissionId = submissionId;
    if (severity) where.severity = severity;
    if (isResolved !== undefined) where.isResolved = isResolved === 'true';

    const results = await prisma.validationResult.findMany({
      where,
      include: {
        validationRule: true,
        submission: {
          select: {
            id: true,
            category: true,
            principleCode: true,
            orgUnit: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const passCount = results.filter((r) => r.severity === 'pass').length;
    const warningCount = results.filter((r) => r.severity === 'warning' && !r.isResolved).length;
    const errorCount = results.filter((r) => r.severity === 'error' && !r.isResolved).length;

    res.json({
      success: true,
      data: {
        summary: {
          total: results.length,
          pass: passCount,
          warning: warningCount,
          error: errorCount,
          hasBlockingErrors: errorCount > 0,
        },
        results,
      },
    });
  } catch (error: any) {
    logger.error('Get validation results error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch validation results.' });
  }
});

/**
 * Resolve a validation warning or exception with comments
 */
router.post('/resolve/:id', async (req: any, res) => {
  try {
    const { id } = req.params;
    const { resolutionNotes } = req.body;

    if (!resolutionNotes || resolutionNotes.trim().length === 0) {
      res.status(400).json({ success: false, error: 'Resolution notes or justification are required.' });
      return;
    }

    const resolved = await validationEngine.resolveIssue({
      tenantId: req.user!.tenantId,
      resultId: id,
      userId: req.user!.userId,
      resolutionNotes,
    });

    await prisma.auditLog.create({
      data: {
        tenantId: req.user!.tenantId,
        userId: req.user!.userId,
        action: 'resolve_validation',
        entityType: 'validation_result',
        entityId: id,
        newValue: JSON.stringify({ resolutionNotes }),
      },
    });

    res.json({ success: true, data: resolved });
  } catch (error: any) {
    logger.error('Resolve validation error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to resolve validation issue.' });
  }
});

export default router;
