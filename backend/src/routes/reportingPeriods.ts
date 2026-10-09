import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { tenantResolver } from '../middleware/tenant';
import prisma from '../config/database';
import logger from '../config/logger';

const router = Router();

router.use(authenticate, tenantResolver);

// Get reporting periods
router.get('/', async (req: any, res) => {
  try {
    const periods = await prisma.reportingPeriod.findMany({
      where: { tenantId: req.user!.tenantId },
      include: {
        frameworkVersion: {
          include: { framework: true },
        },
        _count: { select: { submissions: true } },
      },
      orderBy: { startDate: 'desc' },
    });
    res.json({ success: true, data: periods });
  } catch (error: any) {
    logger.error('Get reporting periods error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch reporting periods.' });
  }
});

// Create reporting period
router.post('/', async (req: any, res) => {
  try {
    const { companyId, name, startDate, endDate, frameworkVersionId, brsr, brsrCore, valueChain, assuranceTracking, voluntaryDisclosures, deadline } = req.body;

    const period = await prisma.reportingPeriod.create({
      data: {
        tenantId: req.user!.tenantId,
        companyId,
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        frameworkVersionId: frameworkVersionId || null,
        brsr: brsr ?? true,
        brsrCore: brsrCore ?? false,
        valueChain: valueChain ?? false,
        assuranceTracking: assuranceTracking ?? false,
        voluntaryDisclosures: voluntaryDisclosures ?? false,
        deadline: deadline ? new Date(deadline) : null,
        createdBy: req.user!.userId,
      },
      include: {
        frameworkVersion: { include: { framework: true } },
      },
    });

    await prisma.auditLog.create({
      data: {
        tenantId: req.user!.tenantId,
        userId: req.user!.userId,
        action: 'create',
        entityType: 'reporting_period',
        entityId: period.id,
        newValue: req.body,
      },
    });

    res.status(201).json({ success: true, data: period });
  } catch (error: any) {
    logger.error('Create reporting period error:', error);
    res.status(500).json({ success: false, error: 'Failed to create reporting period.' });
  }
});

// Update reporting period
router.put('/:id', async (req: any, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.reportingPeriod.findFirst({
      where: { id, tenantId: req.user!.tenantId },
    });

    if (!existing) {
      res.status(404).json({ success: false, error: 'Reporting period not found.' });
      return;
    }

    const updated = await prisma.reportingPeriod.update({
      where: { id },
      data: {
        name: req.body.name ?? existing.name,
        startDate: req.body.startDate ? new Date(req.body.startDate) : existing.startDate,
        endDate: req.body.endDate ? new Date(req.body.endDate) : existing.endDate,
        frameworkVersionId: req.body.frameworkVersionId ?? existing.frameworkVersionId,
        status: req.body.status ?? existing.status,
        brsr: req.body.brsr ?? existing.brsr,
        brsrCore: req.body.brsrCore ?? existing.brsrCore,
        valueChain: req.body.valueChain ?? existing.valueChain,
        deadline: req.body.deadline ? new Date(req.body.deadline) : existing.deadline,
      },
    });

    res.json({ success: true, data: updated });
  } catch (error: any) {
    logger.error('Update reporting period error:', error);
    res.status(500).json({ success: false, error: 'Failed to update reporting period.' });
  }
});

export default router;
