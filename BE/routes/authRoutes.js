import express from 'express';
import * as authController from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
// Guest checkout - create/get guest account and return token (unprotected)
router.post('/guest', authController.createGuestAccount);
// Password reset routes
router.post('/forgot-password', authController.requestPasswordReset);
router.post('/verify-otp', authController.verifyPasswordResetOTP);
router.post('/reset-password', authController.resetPassword);

// Protected routes
router.get('/profile', authenticateToken, authController.getProfile);
router.put('/profile', authenticateToken, authController.updateProfile);

export default router;
