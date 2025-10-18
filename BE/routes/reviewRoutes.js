import express from 'express';
import * as reviewController from '../controllers/reviewController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/products/:id', reviewController.getProductReviews);

// Protected routes
router.post('/products/:id', authenticateToken, reviewController.createReview);
router.put('/:id', authenticateToken, reviewController.updateReview);
router.delete('/:id', authenticateToken, reviewController.deleteReview);
router.get('/', authenticateToken, reviewController.getUserReviews);

export default router;
