import express from "express";
import * as favoriteController from "../controllers/favoriteController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get user's favorites
router.get("/", favoriteController.getFavorites);

// Add product to favorites
router.post("/", favoriteController.addToFavorites);

// Remove product from favorites
router.delete("/:productId", favoriteController.removeFromFavorites);

// Check if product is in favorites
router.get("/check/:productId", favoriteController.checkFavorite);

export default router;

