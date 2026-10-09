import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { tenantResolver } from '../middleware/tenant';
import prisma from '../config/database';
import logger from '../config/logger';

const router = Router();
router.use(authenticate, tenantResolver);

/**
 * Get comments for a submission
 */
router.get('/', async (req: any, res) => {
  try {
    const tenantId = req.user!.tenantId;
    const { submissionId } = req.query;

    if (!submissionId) {
      res.status(400).json({ success: false, error: 'submissionId query parameter is required.' });
      return;
    }

    const comments = await prisma.comment.findMany({
      where: { tenantId, submissionId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, designation: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json({ success: true, data: comments });
  } catch (error: any) {
    logger.error('Get comments error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch comments.' });
  }
});

/**
 * Create a new comment
 */
router.post('/', async (req: any, res) => {
  try {
    const { submissionId, text, type } = req.body;

    if (!submissionId || !text || text.trim().length === 0) {
      res.status(400).json({ success: false, error: 'submissionId and text are required.' });
      return;
    }

    const comment = await prisma.comment.create({
      data: {
        tenantId: req.user!.tenantId,
        submissionId,
        userId: req.user!.userId,
        text,
        type: type || 'comment',
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, designation: true } },
      },
    });

    res.status(201).json({ success: true, data: comment });
  } catch (error: any) {
    logger.error('Create comment error:', error);
    res.status(500).json({ success: false, error: 'Failed to create comment.' });
  }
});

export default router;
