import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { tenantResolver } from '../middleware/tenant';
import prisma from '../config/database';
import logger from '../config/logger';

const router = Router();
router.use(authenticate, tenantResolver);

/**
 * Get configured workflow steps for tenant
 */
router.get('/steps', async (req: any, res) => {
  try {
    const tenantId = req.user!.tenantId;

    const steps = await prisma.workflowStep.findMany({
      where: { tenantId },
      orderBy: { stepOrder: 'asc' },
    });

    res.json({ success: true, data: steps });
  } catch (error: any) {
    logger.error('Get workflow steps error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch workflow steps.' });
  }
});

/**
 * Get workflow history / transitions for a submission
 */
router.get('/history/:submissionId', async (req: any, res) => {
  try {
    const { submissionId } = req.params;
    const tenantId = req.user!.tenantId;

    const transitions = await prisma.workflowTransition.findMany({
      where: { submissionId, tenantId },
      orderBy: { createdAt: 'asc' },
    });

    res.json({ success: true, data: transitions });
  } catch (error: any) {
    logger.error('Get workflow history error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch workflow history.' });
  }
});

export default router;
