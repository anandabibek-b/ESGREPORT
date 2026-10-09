import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/register', (req, res) => authController.register(req, res));
router.post('/login', (req, res) => authController.login(req, res));
router.post('/refresh', (req, res) => authController.refreshToken(req, res));

// Password Reset & Phone Verification (Public)
router.post('/forgot-password/request', (req, res) => authController.requestPasswordReset(req, res));
router.post('/forgot-password/verify-otp', (req, res) => authController.verifyResetOtp(req, res));
router.post('/reset-password', (req, res) => authController.resetPassword(req, res));

// Protected routes
router.get('/me', authenticate, (req, res) => authController.me(req, res));
router.post('/connect-phone', authenticate, (req, res) => authController.connectPhone(req as any, res));

export default router;
