import Review from '../models/Review.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

export const getProductReviews = async (productId) => {
  try {
    const reviews = await Review.find({ product: productId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    
    return reviews;
  } catch (error) {
    throw error;
  }
};

export const createReview = async (reviewData, userId, userName) => {
  try {
    const { productId, rating, review } = reviewData;
    
    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }
    
    // Check if user has purchased this product
    const hasPurchased = await Order.findOne({
      user: userId,
      status: 'paid',
      'items.product': productId
    });
    
    if (!hasPurchased) {
      throw new Error('You can only review products you have purchased');
    }
    
    // Check if user has already reviewed this product
    const existingReview = await Review.findOne({
      product: productId,
      user: userId
    });
    
    if (existingReview) {
      throw new Error('You have already reviewed this product');
    }
    
    const newReview = new Review({
      product: productId,
      user: userId,
      userName,
      rating: parseInt(rating),
      review
    });
    
    await newReview.save();
    return await newReview.populate('user', 'name');
  } catch (error) {
    throw error;
  }
};

export const updateReview = async (reviewId, updateData, userId) => {
  try {
    const { rating, review } = updateData;
    
    if (rating && (rating < 1 || rating > 5)) {
      throw new Error('Rating must be between 1 and 5');
    }
    
    const updatedReview = await Review.findOneAndUpdate(
      { _id: reviewId, user: userId },
      { 
        ...(rating && { rating: parseInt(rating) }), 
        ...(review && { review }),
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).populate('user', 'name');
    
    if (!updatedReview) {
      throw new Error('Review not found or access denied');
    }
    
    return updatedReview;
  } catch (error) {
    throw error;
  }
};

export const deleteReview = async (reviewId, userId) => {
  try {
    const review = await Review.findOneAndDelete({
      _id: reviewId,
      user: userId
    });
    
    if (!review) {
      throw new Error('Review not found or access denied');
    }
    
    return { message: 'Review deleted successfully' };
  } catch (error) {
    throw error;
  }
};

export const getUserReviews = async (userId, userRole) => {
  try {
    let query = {};
    
    // Admin can see all reviews, others only their own
    if (userRole !== 'admin') {
      query.user = userId;
    }
    
    const reviews = await Review.find(query)
      .populate('product', 'name imageUrl')
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    
    return reviews;
  } catch (error) {
    throw error;
  }
};
