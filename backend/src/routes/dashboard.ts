import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { tenantResolver } from '../middleware/tenant';
import { dashboardController } from '../controllers/dashboardController';

const router = Router();

router.use(authenticate, tenantResolver);

router.get('/', (req, res) => dashboardController.getExecutiveDashboard(req as any, res));
router.get('/executive', (req, res) => dashboardController.getExecutiveDashboard(req as any, res));
router.get('/environmental', (req, res) => dashboardController.getEnvironmentalDashboard(req as any, res));
router.get('/social', (req, res) => dashboardController.getSocialDashboard(req as any, res));
router.get('/governance', (req, res) => dashboardController.getGovernanceDashboard(req as any, res));

export default router;
