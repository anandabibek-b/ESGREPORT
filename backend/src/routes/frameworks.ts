import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { tenantResolver } from '../middleware/tenant';
import { frameworkController } from '../controllers/frameworkController';

const router = Router();

router.use(authenticate, tenantResolver);

router.get('/', (req, res) => frameworkController.getFrameworks(req as any, res));
router.get('/versions/:id', (req, res) => frameworkController.getFrameworkVersion(req as any, res));
router.get('/questions', (req, res) => frameworkController.getQuestions(req as any, res));
router.get('/metrics', (req, res) => frameworkController.getMetrics(req as any, res));
router.get('/brsr-core', (req, res) => frameworkController.getBrsrCore(req as any, res));

export default router;
