import User from "../models/User.js";
import Product from "../models/Product.js";

// Get user's favorite products
export const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "favorites",
      populate: {
        path: "category",
        select: "name",
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Filter out inactive products
    const activeFavorites = user.favorites.filter(
      (product) => product && product.isActive !== false
    );

    res.json(activeFavorites);
  } catch (error) {
    console.error("Error fetching favorites:", error);
    res.status(500).json({ message: error.message });
  }
};

// Add product to favorites
export const addToFavorites = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if product is already in favorites
    const isAlreadyFavorite = user.favorites.some(
      (fav) => fav.toString() === productId
    );
    if (isAlreadyFavorite) {
      return res.status(400).json({ message: "Product already in favorites" });
    }

    // Add product to favorites
    user.favorites.push(productId);
    await user.save();

    res.json({ message: "Product added to favorites", favorites: user.favorites });
  } catch (error) {
    console.error("Error adding to favorites:", error);
    res.status(500).json({ message: error.message });
  }
};

// Remove product from favorites
export const removeFromFavorites = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove product from favorites
    user.favorites = user.favorites.filter(
      (fav) => fav.toString() !== productId
    );
    await user.save();

    res.json({ message: "Product removed from favorites", favorites: user.favorites });
  } catch (error) {
    console.error("Error removing from favorites:", error);
    res.status(500).json({ message: error.message });
  }
};

// Check if product is in favorites
export const checkFavorite = async (req, res) => {
  try {
    const { productId } = req.params;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isFavorite = user.favorites.some(
      (fav) => fav.toString() === productId
    );

    res.json({ isFavorite });
  } catch (error) {
    console.error("Error checking favorite:", error);
    res.status(500).json({ message: error.message });
  }
};

