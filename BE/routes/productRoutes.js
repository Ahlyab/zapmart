import express from 'express';
import * as productController from '../controllers/productController.js';
import { authenticateToken, requireRole, requireApproval } from '../middleware/auth.js';
import { uploadProductImages } from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// Protected routes - Seller only
router.post('/', 
  authenticateToken, 
  requireRole(['seller']), 
  requireApproval,
  uploadProductImages,
  productController.createProduct
);

router.put('/:id', 
  authenticateToken, 
  requireRole(['seller']), 
  requireApproval,
  uploadProductImages,
  productController.updateProduct
);

router.delete('/:id', 
  authenticateToken, 
  productController.deleteProduct
);

// Seller routes
router.get('/seller/products', 
  authenticateToken, 
  requireRole(['seller']), 
  productController.getSellerProducts
);

export default router;
