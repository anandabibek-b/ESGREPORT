import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { tenantResolver } from '../middleware/tenant';
import prisma from '../config/database';
import logger from '../config/logger';

const router = Router();

router.use(authenticate, tenantResolver);

// Get audit logs
router.get('/', async (req: any, res) => {
  try {
    const tenantId = req.user!.tenantId;
    const { page = '1', limit = '50', action, entityType, userId, startDate, endDate } = req.query;

    const where: any = { tenantId };
    if (action) where.action = action;
    if (entityType) where.entityType = entityType;
    if (userId) where.userId = userId;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.auditLog.count({ where }),
    ]);

    res.json({
      success: true,
      data: logs,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error: any) {
    logger.error('Get audit logs error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch audit logs.' });
  }
});

export default router;
