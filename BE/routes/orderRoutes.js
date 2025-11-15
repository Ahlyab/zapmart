import express from "express";
import * as orderController from "../controllers/orderController.js";
import { authenticateToken, requireRole } from "../middleware/auth.js";

const router = express.Router();

// Public routes (unprotected - no authentication required)
// Guest checkout endpoint - allows guests to place orders without logging in
router.post("/guest", orderController.createGuestOrder);
router.get("/track", orderController.trackOrder);

// Protected routes
router.post("/", authenticateToken, orderController.createOrder);
router.get("/", authenticateToken, orderController.getUserOrders);
router.get("/:id", authenticateToken, orderController.getOrderById);

// Seller routes
router.get(
  "/seller/orders",
  authenticateToken,
  requireRole(["seller"]),
  orderController.getSellerOrders
);

// Seller update order status (with tracking number if needed)
router.put(
  "/seller/orders/:id/status",
  authenticateToken,
  requireRole(["seller"]),
  orderController.updateOrderStatus
);

export default router;
