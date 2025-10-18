import Product from "../models/Product.js";
import Review from "../models/Review.js";

export const getAllProducts = async (filters = {}) => {
  try {
    const { category, search, page = 1, limit = 10 } = filters;

    let query = { isActive: true };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const products = await Product.find(query)
      .populate("category", "name description")
      .populate("seller", "name email")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Add review stats to each product
    const productsWithReviews = await Promise.all(
      products.map(async (product) => {
        const reviews = await Review.find({ product: product._id });
        const totalReviews = reviews.length;
        const averageRating =
          totalReviews > 0
            ? reviews.reduce((sum, review) => sum + review.rating, 0) /
              totalReviews
            : 0;

        const ratingDistribution = {
          5: reviews.filter((r) => r.rating === 5).length,
          4: reviews.filter((r) => r.rating === 4).length,
          3: reviews.filter((r) => r.rating === 3).length,
          2: reviews.filter((r) => r.rating === 2).length,
          1: reviews.filter((r) => r.rating === 1).length,
        };

        return {
          ...product.toObject(),
          id: product._id.toString(),
          reviewStats: {
            totalReviews,
            averageRating: Math.round(averageRating * 10) / 10,
            ratingDistribution,
          },
        };
      })
    );

    return productsWithReviews;
  } catch (error) {
    throw error;
  }
};

export const getProductById = async (productId) => {
  try {
    const product = await Product.findById(productId)
      .populate("category", "name description")
      .populate("seller", "name email");

    if (!product) {
      throw new Error("Product not found");
    }

    // Get reviews for this product
    const reviews = await Review.find({ product: productId });
    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
        : 0;

    const ratingDistribution = {
      5: reviews.filter((r) => r.rating === 5).length,
      4: reviews.filter((r) => r.rating === 4).length,
      3: reviews.filter((r) => r.rating === 3).length,
      2: reviews.filter((r) => r.rating === 2).length,
      1: reviews.filter((r) => r.rating === 1).length,
    };

    return {
      ...product.toObject(),
      id: product._id.toString(),
      reviewStats: {
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10,
        ratingDistribution,
      },
    };
  } catch (error) {
    throw error;
  }
};

export const createProduct = async (productData, sellerId) => {
  try {
    const product = new Product({
      ...productData,
      seller: sellerId,
    });

    await product.save();
    const populatedProduct = await product.populate(
      "category",
      "name description"
    );
    return {
      ...populatedProduct.toObject(),
      id: populatedProduct._id.toString(),
    };
  } catch (error) {
    throw error;
  }
};

export const updateProduct = async (productId, updateData, sellerId) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: productId, seller: sellerId },
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate("category", "name description");

    if (!product) {
      throw new Error("Product not found or access denied");
    }

    return {
      ...product.toObject(),
      id: product._id.toString(),
    };
  } catch (error) {
    throw error;
  }
};

export const deleteProduct = async (productId, userId, userRole) => {
  try {
    let query = { _id: productId };

    // Only allow seller to delete their own products, or admin to delete any
    if (userRole !== "admin") {
      query.seller = userId;
    }

    const product = await Product.findOneAndDelete(query);

    if (!product) {
      throw new Error("Product not found or access denied");
    }

    return { message: "Product deleted successfully" };
  } catch (error) {
    throw error;
  }
};

export const getSellerProducts = async (sellerId) => {
  try {
    const products = await Product.find({ seller: sellerId })
      .populate("category", "name description")
      .sort({ createdAt: -1 });

    return products.map((product) => ({
      ...product.toObject(),
      id: product._id.toString(),
      category: product.category?._id?.toString() || product.category, // Ensure category ID is returned
    }));
  } catch (error) {
    throw error;
  }
};
