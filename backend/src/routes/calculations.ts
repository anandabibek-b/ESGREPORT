import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { tenantResolver } from '../middleware/tenant';
import { calculationEngine } from '../services/calculationService';
import logger from '../config/logger';

const router = Router();
router.use(authenticate, tenantResolver);

/**
 * Get all deterministic calculations
 */
router.get('/', async (req: any, res) => {
  try {
    const { submissionId } = req.query;
    const calculations = await calculationEngine.getCalculations(req.user!.tenantId, submissionId);
    res.json({ success: true, data: calculations });
  } catch (error: any) {
    logger.error('Get calculations error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch calculation records.' });
  }
});

/**
 * Execute Scope 1 fuel emission calculation
 */
router.post('/scope1', async (req: any, res) => {
  try {
    const { fuelLitres, emissionFactor, fuelType, submissionId, metricValueId } = req.body;

    if (!fuelLitres || fuelLitres <= 0) {
      res.status(400).json({ success: false, error: 'Fuel litres must be a positive number.' });
      return;
    }

    const result = await calculationEngine.calculateScope1Emissions({
      tenantId: req.user!.tenantId,
      submissionId,
      metricValueId,
      fuelLitres: parseFloat(fuelLitres),
      emissionFactor: emissionFactor ? parseFloat(emissionFactor) : undefined,
      fuelType,
      calculatedById: req.user!.userId,
    });

    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    logger.error('Scope 1 calculation error:', error);
    res.status(500).json({ success: false, error: 'Failed to calculate Scope 1 emissions.' });
  }
});

/**
 * Execute Scope 2 purchased grid emission calculation
 */
router.post('/scope2', async (req: any, res) => {
  try {
    const { electricityMWh, gridFactor, submissionId, metricValueId } = req.body;

    if (!electricityMWh || electricityMWh <= 0) {
      res.status(400).json({ success: false, error: 'Electricity MWh must be a positive number.' });
      return;
    }

    const result = await calculationEngine.calculateScope2Emissions({
      tenantId: req.user!.tenantId,
      submissionId,
      metricValueId,
      electricityMWh: parseFloat(electricityMWh),
      gridFactor: gridFactor ? parseFloat(gridFactor) : undefined,
      calculatedById: req.user!.userId,
    });

    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    logger.error('Scope 2 calculation error:', error);
    res.status(500).json({ success: false, error: 'Failed to calculate Scope 2 emissions.' });
  }
});

/**
 * Execute Renewable electricity share calculation
 */
router.post('/renewable-share', async (req: any, res) => {
  try {
    const { renewableMWh, nonRenewableMWh, submissionId, metricValueId } = req.body;

    const result = await calculationEngine.calculateRenewableShare({
      tenantId: req.user!.tenantId,
      submissionId,
      metricValueId,
      renewableMWh: parseFloat(renewableMWh || 0),
      nonRenewableMWh: parseFloat(nonRenewableMWh || 0),
      calculatedById: req.user!.userId,
    });

    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    logger.error('Renewable share calculation error:', error);
    res.status(500).json({ success: false, error: 'Failed to calculate renewable share.' });
  }
});

/**
 * Execute Safety LTIFR calculation
 */
router.post('/ltifr', async (req: any, res) => {
  try {
    const { lostTimeInjuries, totalPersonHours, submissionId, metricValueId } = req.body;

    if (!totalPersonHours || totalPersonHours <= 0) {
      res.status(400).json({ success: false, error: 'Total person-hours must be greater than zero.' });
      return;
    }

    const result = await calculationEngine.calculateLTIFR({
      tenantId: req.user!.tenantId,
      submissionId,
      metricValueId,
      lostTimeInjuries: parseFloat(lostTimeInjuries || 0),
      totalPersonHours: parseFloat(totalPersonHours),
      calculatedById: req.user!.userId,
    });

    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    logger.error('LTIFR calculation error:', error);
    res.status(500).json({ success: false, error: 'Failed to calculate LTIFR.' });
  }
});

export default router;
