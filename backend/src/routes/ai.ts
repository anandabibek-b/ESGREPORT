import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { tenantResolver } from '../middleware/tenant';
import { aiAssistantService } from '../services/aiAssistantService';
import logger from '../config/logger';

const router = Router();
router.use(authenticate, tenantResolver);

/**
 * Ask ESG AI assistant a question grounded in application database records
 */
router.post('/query', async (req: any, res) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      res.status(400).json({ success: false, error: 'Query text is required.' });
      return;
    }

    const result = await aiAssistantService.processQuery(req.user!.tenantId, query);
    res.json({ success: true, data: result });
  } catch (error: any) {
    logger.error('AI assistant query error:', error);
    res.status(500).json({ success: false, error: 'Failed to process AI assistant query.' });
  }
});

export default router;
