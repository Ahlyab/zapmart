import * as reviewService from '../services/reviewService.js';

export const getProductReviews = async (req, res) => {
  try {
    const reviews = await reviewService.getProductReviews(req.params.id);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createReview = async (req, res) => {
  try {
    const review = await reviewService.createReview(
      { ...req.body, productId: req.params.id },
      req.user._id,
      req.user.name
    );
    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateReview = async (req, res) => {
  try {
    const review = await reviewService.updateReview(
      req.params.id,
      req.body,
      req.user._id
    );
    res.json(review);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const result = await reviewService.deleteReview(req.params.id, req.user._id);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getUserReviews = async (req, res) => {
  try {
    const reviews = await reviewService.getUserReviews(req.user._id, req.user.role);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
