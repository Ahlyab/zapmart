import express from "express";
import * as productController from "../controllers/productController.js";
import {
  authenticateToken,
  requireRole,
  requireApproval,
} from "../middleware/auth.js";

const router = express.Router();

// All seller routes require authentication and seller role
router.use(authenticateToken);
router.use(requireRole(["seller"]));
router.use(requireApproval);

// Get seller's products
router.get("/products", productController.getSellerProducts);

export default router;
