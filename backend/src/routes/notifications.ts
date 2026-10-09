import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { tenantResolver } from '../middleware/tenant';
import prisma from '../config/database';
import logger from '../config/logger';

const router = Router();
router.use(authenticate, tenantResolver);

/**
 * Get notifications for current user
 */
router.get('/', async (req: any, res) => {
  try {
    const tenantId = req.user!.tenantId;
    const userId = req.user!.userId;
    const { status = 'all' } = req.query;

    const where: any = { tenantId, userId };
    if (status === 'unread') where.isRead = false;
    if (status === 'read') where.isRead = true;

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({
        where: { tenantId, userId, isRead: false },
      }),
    ]);

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
      },
    });
  } catch (error: any) {
    logger.error('Get notifications error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch notifications.' });
  }
});

/**
 * Mark a notification as read
 */
router.put('/:id/read', async (req: any, res) => {
  try {
    const { id } = req.params;
    const notification = await prisma.notification.updateMany({
      where: { id, userId: req.user!.userId, tenantId: req.user!.tenantId },
      data: { isRead: true, readAt: new Date() },
    });

    res.json({ success: true, message: 'Notification marked as read.' });
  } catch (error: any) {
    logger.error('Mark notification read error:', error);
    res.status(500).json({ success: false, error: 'Failed to update notification.' });
  }
});

/**
 * Mark all notifications as read
 */
router.put('/read-all', async (req: any, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user!.userId, tenantId: req.user!.tenantId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });

    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (error: any) {
    logger.error('Mark all read error:', error);
    res.status(500).json({ success: false, error: 'Failed to update notifications.' });
  }
});

export default router;
