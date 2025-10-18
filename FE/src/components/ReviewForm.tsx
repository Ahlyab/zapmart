import React, { useState, useEffect } from "react";
import { Star, Send, Edit, Trash2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import { API_ENDPOINTS } from "../config/api";

interface ReviewFormProps {
  productId: string;
  onReviewSubmitted: () => void;
  existingReview?: {
    id: string;
    rating: number;
    review: string;
  };
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  productId,
  onReviewSubmitted,
  existingReview,
}) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [review, setReview] = useState(existingReview?.review || "");
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Check if user has purchased this product
  const [hasPurchased, setHasPurchased] = useState(false);
  const [checkingPurchase, setCheckingPurchase] = useState(true);

  useEffect(() => {
    const checkPurchaseStatus = async () => {
      if (!user) {
        setCheckingPurchase(false);
        return;
      }

      try {
        const response = await axios.get(API_ENDPOINTS.ORDERS, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const hasBought = response.data.some((order: unknown) => {
          const orderData = order as {
            status: string;
            items: Array<{ product: string }>;
          };
          return (
            orderData.status === "paid" &&
            orderData.items.some((item) => item.product === productId)
          );
        });

        setHasPurchased(hasBought);
      } catch (error) {
        console.error("Error checking purchase status:", error);
        setHasPurchased(false);
      } finally {
        setCheckingPurchase(false);
      }
    };

    checkPurchaseStatus();
  }, [productId, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!rating || rating < 1) {
      setError("Please select a rating");
      return;
    }

    if (!review.trim()) {
      setError("Please write a review");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      if (existingReview && isEditing) {
        // Update existing review
        await axios.put(
          `${API_ENDPOINTS.REVIEWS}/${existingReview.id}`,
          {
            rating,
            review: review.trim(),
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
      } else {
        // Create new review
        await axios.post(
          `${API_ENDPOINTS.REVIEWS}/products/${productId}`,
          {
            rating,
            review: review.trim(),
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
      }

      onReviewSubmitted();
      if (!existingReview) {
        setRating(0);
        setReview("");
      }
      setIsEditing(false);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message || "Failed to submit review"
          : "Failed to submit review";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!existingReview) return;

    if (!confirm("Are you sure you want to delete this review?")) return;

    setIsSubmitting(true);
    try {
      await axios.delete(`${API_ENDPOINTS.REVIEWS}/${existingReview.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      onReviewSubmitted();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message || "Failed to delete review"
          : "Failed to delete review";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg border">
        <p className="text-gray-600 text-center">
          Please log in to leave a review
        </p>
      </div>
    );
  }

  if (checkingPurchase) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg border">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!hasPurchased) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg border">
        <p className="text-gray-600 text-center">
          You can only review products you have purchased.
          <br />
          <span className="text-sm text-gray-500">
            Complete a purchase to leave a review.
          </span>
        </p>
      </div>
    );
  }

  if (existingReview && !isEditing) {
    return (
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Your Review</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              title="Edit review"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={handleDelete}
              disabled={isSubmitting}
              className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
              title="Delete review"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center mb-3">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-5 w-5 ${
                star <= existingReview.rating
                  ? "text-yellow-400 fill-current"
                  : "text-gray-300"
              }`}
            />
          ))}
          <span className="ml-2 text-sm text-gray-600">
            {existingReview.rating}/5
          </span>
        </div>

        <p className="text-gray-700">{existingReview.review}</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {existingReview ? "Edit Review" : "Write a Review"}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating *
          </label>
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="p-1 hover:scale-110 transition-transform"
              >
                <Star
                  className={`h-8 w-8 ${
                    star <= (hoveredRating || rating)
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300"
                  }`}
                />
              </button>
            ))}
            <span className="ml-3 text-sm text-gray-600">
              {rating > 0 ? `${rating}/5` : "Select rating"}
            </span>
          </div>
        </div>

        {/* Review Text */}
        <div>
          <label
            htmlFor="review"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Review *
          </label>
          <textarea
            id="review"
            value={review}
            onChange={(e) => setReview(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Share your experience with this product..."
            required
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={isSubmitting || !rating || !review.trim()}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>
                  {existingReview ? "Update Review" : "Submit Review"}
                </span>
              </>
            )}
          </button>

          {existingReview && (
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setRating(existingReview.rating);
                setReview(existingReview.review);
                setError("");
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;
