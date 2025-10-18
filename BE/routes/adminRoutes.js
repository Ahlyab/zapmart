import express from "express";
import * as adminController from "../controllers/adminController.js";
import { authenticateToken, requireRole } from "../middleware/auth.js";

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(requireRole(["admin"]));

// Stats and overview
router.get("/stats", adminController.getStats);

// User management
router.get("/users", adminController.getAllUsers);
router.put("/users/:id/approve", adminController.approveUser);
router.put("/users/:id/ban", adminController.banUser);
router.delete("/users/:id", adminController.deleteUser);

// Product management
router.get("/products", adminController.getAllProducts);

// Order management
router.get("/orders", adminController.getAllOrders);
router.get("/orders/:id", adminController.getOrderById);

// Transactions (same as orders for admin)
router.get("/transactions", adminController.getAllOrders);

// Category management
router.get("/categories", adminController.getAllCategories);
router.post("/categories", adminController.createCategory);
router.put("/categories/:id", adminController.updateCategory);
router.delete("/categories/:id", adminController.deleteCategory);

export default router;
