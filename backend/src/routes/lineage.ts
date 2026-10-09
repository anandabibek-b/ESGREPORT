import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { tenantResolver } from '../middleware/tenant';
import prisma from '../config/database';
import logger from '../config/logger';

const router = Router();
router.use(authenticate, tenantResolver);

// List all traceable metric values
router.get('/', async (req: any, res) => {
  try {
    const tenantId = req.user!.tenantId;
    const metricValues = await prisma.metricValue.findMany({
      where: { tenantId },
      include: {
        question: { select: { code: true, text: true } },
        metric: { select: { code: true, name: true, unit: true } },
        submission: {
          select: {
            id: true,
            status: true,
            orgUnit: { select: { name: true } },
            reportingPeriod: { select: { name: true } },
          },
        },
      },
      take: 50,
      orderBy: { updatedAt: 'desc' },
    });

    res.json({ success: true, data: metricValues });
  } catch (error: any) {
    logger.error('List lineage metrics error:', error);
    res.status(500).json({ success: false, error: 'Failed to list lineage metrics.' });
  }
});

/**
 * Get lineage graph for a metric value or submission
 */
router.get('/:metricValueId', async (req: any, res) => {
  try {
    const { metricValueId } = req.params;
    const tenantId = req.user!.tenantId;

    const metricValue = await prisma.metricValue.findFirst({
      where: { id: metricValueId, tenantId },
      include: {
        question: {
          include: {
            indicator: {
              include: { principle: { include: { section: true } } },
            },
          },
        },
        metric: { include: { unit: true } },
        submission: {
          include: {
            orgUnit: { include: { type: true, parent: true } },
            reportingPeriod: true,
            evidence: true,
          },
        },
        dataLineage: true,
      },
    });

    if (!metricValue) {
      res.status(404).json({ success: false, error: 'Metric value not found.' });
      return;
    }

    // Get any associated calculation
    const calculation = await prisma.calculation.findFirst({
      where: { metricValueId, tenantId },
      include: { inputs: true },
    });

    // Get any attached evidence matching this question or metric
    const evidenceList = await prisma.evidence.findMany({
      where: {
        tenantId,
        OR: [
          { questionCode: metricValue.question?.code },
          { metricCode: metricValue.metric?.code },
          { submissionId: metricValue.submissionId },
        ],
      },
    });

    // Construct Lineage Nodes & Edges
    const nodes = [
      {
        id: 'evidence',
        type: 'source_document',
        label: evidenceList.length > 0 ? evidenceList[0].fileName : 'Primary Meters / Utility Billing Logs',
        details: {
          count: evidenceList.length,
          files: evidenceList.map((e) => ({ id: e.id, name: e.fileName, hash: e.fileHash, size: e.fileSize })),
        },
      },
      {
        id: 'calculation',
        type: 'deterministic_calculation',
        label: calculation ? calculation.name : 'Direct Activity Measurement',
        details: calculation
          ? {
              formula: calculation.formula,
              methodology: calculation.methodology,
              inputs: calculation.inputs,
              result: `${calculation.resultValue} ${calculation.resultUnit}`,
            }
          : { method: 'Sum of meter telemetry' },
      },
      {
        id: 'metric',
        type: 'esg_metric',
        label: metricValue.question?.text || metricValue.metric?.name,
        details: {
          code: metricValue.question?.code || metricValue.metric?.code,
          value: metricValue.numericValue ?? metricValue.textValue,
          unit: metricValue.unit || metricValue.metric?.unit?.symbol,
          previousBaseline: metricValue.previousValue,
          variance: metricValue.variance,
        },
      },
      {
        id: 'submission',
        type: 'org_unit_submission',
        label: `${metricValue.submission.orgUnit.name} (${metricValue.submission.reportingPeriod.name})`,
        details: {
          orgUnit: metricValue.submission.orgUnit.name,
          category: metricValue.submission.category,
          status: metricValue.submission.status,
          qualityScore: metricValue.submission.dataQualityScore,
        },
      },
      {
        id: 'report',
        type: 'sebi_brsr_report',
        label: 'Consolidated BRSR Annual Filing',
        details: {
          entity: 'Megha Engineering and Infrastructures Limited',
          principle: metricValue.question?.indicator.principle.name,
          section: metricValue.question?.indicator.principle.section.name,
        },
      },
    ];

    const edges = [
      { from: 'evidence', to: 'calculation', label: 'Feeds Input Telemetry' },
      { from: 'calculation', to: 'metric', label: 'Computes Calibrated Output' },
      { from: 'metric', to: 'submission', label: 'Aggregates to Site Submission' },
      { from: 'submission', to: 'report', label: 'Consolidates to Group Filing' },
    ];

    res.json({
      success: true,
      data: {
        metricValue,
        lineageGraph: { nodes, edges },
      },
    });
  } catch (error: any) {
    logger.error('Get lineage error:', error);
    res.status(500).json({ success: false, error: 'Failed to construct data lineage.' });
  }
});

export default router;
