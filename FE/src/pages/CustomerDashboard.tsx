import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Star,
  MessageSquare,
} from "lucide-react";
import axios from "axios";
import { API_ENDPOINTS } from "../config/api";

interface Order {
  id: string;
  items: Array<{
    product?: {
      _id: string;
      name?: string;
      price?: number;
    };
    productId?: string; // Fallback for compatibility
    name?: string;
    price: number;
    quantity: number;
  }>;
  total: number;
  status: string;
  trackingNumber?: string;
  deliveryPartner?: string;
  createdAt: string;
}

interface Review {
  id: string;
  productId: string;
  rating: number;
  review: string;
  createdAt: string;
  productName?: string;
}

const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"orders" | "reviews">("orders");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [modalProduct, setModalProduct] = useState<{
    productId: string;
    productName: string;
  } | null>(null);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersResponse, reviewsResponse] = await Promise.all([
          axios.get(API_ENDPOINTS.ORDERS),
          axios.get(API_ENDPOINTS.REVIEWS),
        ]);

        setOrders(ordersResponse.data);

        // Fetch product names for reviews
        const reviewsWithProductNames = await Promise.all(
          reviewsResponse.data.map(async (review: Review) => {
            try {
              const productResponse = await axios.get(
                `${API_ENDPOINTS.REVIEWS}/products/${review.productId}`
              );
              return { ...review, productName: productResponse.data.name };
            } catch (error) {
              console.error("Error fetching product name:", error);
              return { ...review, productName: "Unknown Product" };
            }
          })
        );

        setReviews(reviewsWithProductNames);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "paid":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "cancelled":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Package className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "paid":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Function to open review modal
  function openReviewModal(
    productId: string,
    productName: string,
    orderId: string
  ) {
    console.log("Opening review modal for:", {
      productId,
      productName,
      orderId,
    });
    setModalProduct({ productId, productName });

    setReviewText("");
    setReviewRating(5);
    setShowReviewModal(true);
  }
  function closeReviewModal() {
    setShowReviewModal(false);
    setModalProduct(null);
    setReviewText("");
    setReviewRating(5);
  }
  // Function to check whether a product already has a review by this user:
  function hasUserReviewed(productId: string) {
    return reviews.some((r) => r.productId === productId);
  }
  async function submitReview(event: React.FormEvent) {
    event.preventDefault();
    if (!modalProduct) return;
    setSubmittingReview(true);
    try {
      const url = `${API_ENDPOINTS.REVIEWS}/products/${modalProduct.productId}`;
      console.log("Submitting review for product ID:", modalProduct.productId);
      console.log("API URL:", url);
      const resp = await axios.post(url, {
        rating: reviewRating,
        review: reviewText,
      });
      console.log("Review submitted successfully:", resp.data);
      // Optimistically update review state
      setReviews((prev) => [
        {
          id: resp.data._id || resp.data.id,
          productId: modalProduct.productId,
          rating: reviewRating,
          review: reviewText,
          createdAt: new Date().toISOString(),
          productName: modalProduct.productName,
        },
        ...prev,
      ]);
      closeReviewModal();
      // no-eslint-disable-next-line @typescript-eslint/no-explicit-any
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Error submitting review:", err);
      console.error("Product ID used:", modalProduct.productId);
      console.error("Error response:", err.response?.data);
      alert(
        err.response?.data?.message ||
          "Failed to submit review. Please try again."
      );
    } finally {
      setSubmittingReview(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Customer Dashboard
          </h1>
          <p className="text-gray-600">Welcome back, {user?.name}!</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Total Orders
                </h3>
                <p className="text-2xl font-bold text-blue-600">
                  {orders.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Completed Orders
                </h3>
                <p className="text-2xl font-bold text-green-600">
                  {
                    orders.filter((order) => order.status === "completed")
                      .length
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-full">
                <MessageSquare className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Reviews Written
                </h3>
                <p className="text-2xl font-bold text-yellow-600">
                  {reviews.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab("orders")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "orders"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Orders
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "reviews"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Reviews
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "orders" ? (
          /* Orders List */
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Order History
              </h2>
            </div>

            {orders.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-gray-600">
                  No orders found. Start shopping to see your orders here!
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <div key={order.id} className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(order.status)}
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            Order #{order.id.slice(-8)}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status.charAt(0).toUpperCase() +
                            order.status.slice(1)}
                        </span>
                        <p className="text-lg font-bold text-gray-900 mt-1">
                          £{order.total.toFixed(2)}
                        </p>
                        {order.trackingNumber && (
                          <div className="text-xs text-gray-600 mt-1">
                            <span className="font-semibold">Tracking ID:</span>{" "}
                            {order.trackingNumber}
                          </div>
                        )}
                        {order.deliveryPartner && (
                          <div className="text-xs text-gray-600 mt-0.5">
                            <span className="font-semibold">
                              Delivery Partner:
                            </span>{" "}
                            {order.deliveryPartner}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      {order.items.map((item, index) => {
                        const productId =
                          item.product?._id || item.productId || "";
                        const productName =
                          item.product?.name || item.name || "Unknown Product";
                        return (
                          <div
                            key={index}
                            className="flex justify-between items-center text-sm"
                          >
                            <span className="text-gray-600">
                              {productName} x {item.quantity}
                            </span>
                            <span className="text-gray-900">
                              £{(item.price * item.quantity).toFixed(2)}
                            </span>
                            {/* Show leave review conditionally: */}
                            {order.status === "completed" &&
                              productId &&
                              !hasUserReviewed(productId) && (
                                <button
                                  onClick={() =>
                                    openReviewModal(
                                      productId,
                                      productName,
                                      order.id
                                    )
                                  }
                                  className="ml-4 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                                >
                                  Leave Review
                                </button>
                              )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Reviews List */
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                My Reviews
              </h2>
            </div>

            {reviews.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-gray-600">
                  No reviews yet. Review products you've purchased to see them
                  here!
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {reviews.map((review) => (
                  <div key={review.id} className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {review.productName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-5 w-5 ${
                              star <= review.rating
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-gray-700">{review.review}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      {showReviewModal && modalProduct && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-50 backdrop-blur-sm transition-opacity"
          onClick={closeReviewModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4 relative transform transition-all animate-in fade-in zoom-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
              onClick={closeReviewModal}
              aria-label="Close modal"
            >
              <XCircle className="h-6 w-6" />
            </button>

            {/* Header */}
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                Write a Review
              </h3>
              <p className="text-sm text-gray-600">
                Share your experience with{" "}
                <span className="font-semibold text-gray-900">
                  {modalProduct.productName}
                </span>
              </p>
            </div>

            <form onSubmit={submitReview} className="space-y-6">
              {/* Star Rating */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Your Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="transition-transform hover:scale-110 focus:outline-none"
                      aria-label={`Rate ${star} star${star !== 1 ? "s" : ""}`}
                    >
                      <Star
                        className={`h-8 w-8 transition-colors ${
                          star <= reviewRating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300 hover:text-yellow-200"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {reviewRating > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    {reviewRating === 5
                      ? "Excellent!"
                      : reviewRating === 4
                      ? "Great!"
                      : reviewRating === 3
                      ? "Good"
                      : reviewRating === 2
                      ? "Fair"
                      : "Poor"}
                  </p>
                )}
              </div>

              {/* Review Text */}
              <div>
                <label
                  htmlFor="review-text"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Your Review
                </label>
                <textarea
                  id="review-text"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none placeholder-gray-400"
                  minLength={5}
                  rows={5}
                  placeholder="Tell others about your experience with this product..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {reviewText.length} characters (minimum 5)
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeReviewModal}
                  className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold transition-colors"
                  disabled={submittingReview}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
                  disabled={submittingReview || !reviewText.trim()}
                >
                  {submittingReview ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </span>
                  ) : (
                    "Submit Review"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;
