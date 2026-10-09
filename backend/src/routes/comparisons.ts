import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { tenantResolver } from '../middleware/tenant';
import { aiAssistantService } from '../services/aiAssistantService';
import logger from '../config/logger';

const router = Router();
router.use(authenticate, tenantResolver);

/**
 * Compare two reporting periods
 */
router.get('/', async (req: any, res) => {
  try {
    const tenantId = req.user!.tenantId;
    const { currentPeriodId, previousPeriodId } = req.query;

    const comparison = await aiAssistantService.comparePeriods(
      tenantId,
      currentPeriodId as string,
      previousPeriodId as string
    );

    res.json({ success: true, data: comparison });
  } catch (error: any) {
    logger.error('Period comparison error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate period comparison.' });
  }
});

export default router;
