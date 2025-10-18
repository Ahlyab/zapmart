import express from 'express';
import * as paymentController from '../controllers/paymentController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Protected routes
router.post('/create-payment-intent', authenticateToken, paymentController.createPaymentIntent);

export default router;
