import fs from 'fs';
import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { tenantResolver } from '../middleware/tenant';
import { exportService } from '../services/exportService';
import prisma from '../config/database';
import logger from '../config/logger';

const router = Router();
router.use(authenticate, tenantResolver);

/**
 * List all generated reports
 */
router.get('/', async (req: any, res) => {
  try {
    const tenantId = req.user!.tenantId;
    const { reportingPeriodId, format } = req.query;

    const where: any = { tenantId };
    if (reportingPeriodId) where.reportingPeriodId = reportingPeriodId;
    if (format) where.format = format;

    const reports = await prisma.report.findMany({
      where,
      include: {
        reportingPeriod: { select: { id: true, name: true } },
      },
      orderBy: { generatedAt: 'desc' },
    });

    res.json({ success: true, data: reports });
  } catch (error: any) {
    logger.error('Get reports error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch reports list.' });
  }
});

/**
 * Generate PDF Report
 */
router.post('/generate/pdf', async (req: any, res) => {
  try {
    const { reportingPeriodId } = req.body;
    if (!reportingPeriodId) {
      res.status(400).json({ success: false, error: 'Reporting period ID is required.' });
      return;
    }

    const result = await exportService.generatePDF(
      req.user!.tenantId,
      reportingPeriodId,
      req.user!.userId
    );

    // Audit log
    await prisma.auditLog.create({
      data: {
        tenantId: req.user!.tenantId,
        userId: req.user!.userId,
        action: 'export',
        entityType: 'report',
        newValue: JSON.stringify({ format: 'pdf', fileName: result.fileName, size: result.fileSize }),
      },
    });

    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    logger.error('Generate PDF error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to generate PDF report.' });
  }
});

/**
 * Generate Excel (XLSX) Workbook
 */
router.post('/generate/excel', async (req: any, res) => {
  try {
    const { reportingPeriodId } = req.body;
    if (!reportingPeriodId) {
      res.status(400).json({ success: false, error: 'Reporting period ID is required.' });
      return;
    }

    const result = await exportService.generateExcel(
      req.user!.tenantId,
      reportingPeriodId,
      req.user!.userId
    );

    await prisma.auditLog.create({
      data: {
        tenantId: req.user!.tenantId,
        userId: req.user!.userId,
        action: 'export',
        entityType: 'report',
        newValue: JSON.stringify({ format: 'xlsx', fileName: result.fileName, size: result.fileSize }),
      },
    });

    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    logger.error('Generate Excel error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to generate Excel workbook.' });
  }
});

/**
 * Generate Machine-Readable JSON Export
 */
router.get('/generate/json', async (req: any, res) => {
  try {
    const { reportingPeriodId } = req.query;
    if (!reportingPeriodId) {
      res.status(400).json({ success: false, error: 'Reporting period ID is required.' });
      return;
    }

    const jsonReport = await exportService.generateJSON(req.user!.tenantId, reportingPeriodId as string);

    await prisma.auditLog.create({
      data: {
        tenantId: req.user!.tenantId,
        userId: req.user!.userId,
        action: 'export',
        entityType: 'report',
        newValue: JSON.stringify({ format: 'json' }),
      },
    });

    res.json({ success: true, data: jsonReport });
  } catch (error: any) {
    logger.error('Generate JSON error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate JSON report.' });
  }
});

/**
 * Download a generated report file
 */
router.get('/:id/download', async (req: any, res) => {
  try {
    const { id } = req.params;
    const report = await prisma.report.findFirst({
      where: { id, tenantId: req.user!.tenantId },
    });

    if (!report || !report.filePath) {
      res.status(404).json({ success: false, error: 'Report not found or file not ready.' });
      return;
    }

    if (!fs.existsSync(report.filePath)) {
      res.status(404).json({ success: false, error: 'Physical report file missing on disk.' });
      return;
    }

    res.download(report.filePath, `${report.name}.${report.format}`);
  } catch (error: any) {
    logger.error('Download report error:', error);
    res.status(500).json({ success: false, error: 'Failed to download report.' });
  }
});

export default router;
