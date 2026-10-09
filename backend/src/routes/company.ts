import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { tenantResolver } from '../middleware/tenant';
import { companyController, orgUnitController } from '../controllers/companyController';

const router = Router();

// All routes require authentication and tenant context
router.use(authenticate, tenantResolver);

// Company routes
router.get('/', (req, res) => companyController.getCompany(req as any, res));
router.put('/', (req, res) => companyController.updateCompany(req as any, res));
router.post('/complete-onboarding', (req, res) => companyController.completeOnboarding(req as any, res));

export default router;
