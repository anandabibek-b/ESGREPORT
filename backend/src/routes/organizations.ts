import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { tenantResolver } from '../middleware/tenant';
import { orgUnitController } from '../controllers/companyController';

const router = Router();

router.use(authenticate, tenantResolver);

router.get('/', (req, res) => orgUnitController.getOrgUnits(req as any, res));
router.get('/types', (req, res) => orgUnitController.getOrgUnitTypes(req as any, res));
router.post('/', (req, res) => orgUnitController.createOrgUnit(req as any, res));
router.put('/:id', (req, res) => orgUnitController.updateOrgUnit(req as any, res));
router.delete('/:id', (req, res) => orgUnitController.deleteOrgUnit(req as any, res));

export default router;
