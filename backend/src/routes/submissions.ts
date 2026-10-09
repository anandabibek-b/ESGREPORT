import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { tenantResolver } from '../middleware/tenant';
import { submissionController } from '../controllers/submissionController';

const router = Router();

router.use(authenticate, tenantResolver);

// CRUD
router.get('/', (req, res) => submissionController.getSubmissions(req as any, res));
router.get('/:id', (req, res) => submissionController.getSubmission(req as any, res));
router.post('/', (req, res) => submissionController.createSubmission(req as any, res));

// Data entry
router.put('/:id/values', (req, res) => submissionController.saveMetricValues(req as any, res));

// Workflow
router.post('/:id/submit', (req, res) => submissionController.submitForReview(req as any, res));
router.post('/:id/review', (req, res) => submissionController.reviewSubmission(req as any, res));
router.post('/:id/approve', (req, res) => submissionController.approveSubmission(req as any, res));
router.post('/:id/reject', (req, res) => submissionController.rejectSubmission(req as any, res));

export default router;
