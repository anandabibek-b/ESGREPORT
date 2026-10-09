import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { tenantResolver } from '../middleware/tenant';
import prisma from '../config/database';
import logger from '../config/logger';

const router = Router();
router.use(authenticate, tenantResolver);

/**
 * Global search across permitted tenant entities
 */
router.get('/', async (req: any, res) => {
  try {
    const tenantId = req.user!.tenantId;
    const { q } = req.query;

    if (!q || typeof q !== 'string' || q.trim().length === 0) {
      res.json({
        success: true,
        data: {
          questions: [],
          metrics: [],
          evidence: [],
          reports: [],
          orgUnits: [],
          users: [],
        },
      });
      return;
    }

    const searchTerm = q.trim();

    const [questions, metrics, evidence, reports, orgUnits, users] = await Promise.all([
      prisma.question.findMany({
        where: {
          OR: [
            { code: { contains: searchTerm } },
            { text: { contains: searchTerm } },
            { description: { contains: searchTerm } },
          ],
        },
        include: { indicator: { include: { principle: true } } },
        take: 10,
      }),
      prisma.metric.findMany({
        where: {
          OR: [
            { code: { contains: searchTerm } },
            { name: { contains: searchTerm } },
            { description: { contains: searchTerm } },
          ],
        },
        include: { unit: true },
        take: 10,
      }),
      prisma.evidence.findMany({
        where: {
          tenantId,
          OR: [
            { fileName: { contains: searchTerm } },
            { description: { contains: searchTerm } },
            { questionCode: { contains: searchTerm } },
          ],
        },
        take: 10,
      }),
      prisma.report.findMany({
        where: {
          tenantId,
          OR: [
            { name: { contains: searchTerm } },
            { description: { contains: searchTerm } },
          ],
        },
        take: 10,
      }),
      prisma.orgUnit.findMany({
        where: {
          tenantId,
          OR: [
            { name: { contains: searchTerm } },
            { code: { contains: searchTerm } },
            { city: { contains: searchTerm } },
          ],
        },
        include: { type: true },
        take: 10,
      }),
      prisma.user.findMany({
        where: {
          tenantId,
          OR: [
            { firstName: { contains: searchTerm } },
            { lastName: { contains: searchTerm } },
            { email: { contains: searchTerm } },
            { designation: { contains: searchTerm } },
          ],
        },
        select: { id: true, firstName: true, lastName: true, email: true, designation: true },
        take: 10,
      }),
    ]);

    res.json({
      success: true,
      data: {
        query: searchTerm,
        totalResults: questions.length + metrics.length + evidence.length + reports.length + orgUnits.length + users.length,
        questions,
        metrics,
        evidence,
        reports,
        orgUnits,
        users,
      },
    });
  } catch (error: any) {
    logger.error('Search error:', error);
    res.status(500).json({ success: false, error: 'Failed to perform search.' });
  }
});

export default router;
