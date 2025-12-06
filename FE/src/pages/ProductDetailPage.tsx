import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  ArrowLeft,
  Package,
  Truck,
  Star,
  X,
  LogIn,
  User,
} from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import { API_ENDPOINTS } from "../config/api";
import ReviewForm from "../components/ReviewForm";
import ReviewList from "../components/ReviewList";
import FavoriteButton from "../components/FavoriteButton";
import { scrollToTop } from "../utils/helper";

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  affiliatedLink?: string;
  description: string;
  weight: number;
  dimensions: string;
  categoryId: string;
  reviewStats?: {
    totalReviews: number;
    averageRating: number;
    ratingDistribution: {
      5: number;
      4: number;
      3: number;
      2: number;
      1: number;
    };
  };
}

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [userReview, setUserReview] = useState<
    | {
        id: string;
        rating: number;
        review: string;
      }
    | undefined
  >(undefined);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${API_ENDPOINTS.PRODUCTS}/${id}`);
      setProduct(response.data);

      // Check if user has already reviewed this product
      if (user) {
        try {
          const reviewsResponse = await axios.get(
            `${API_ENDPOINTS.REVIEWS}/products/${id}`
          );
          const userReviewData = reviewsResponse.data.find(
            (review: { user: { _id: string } }) => review.user._id === user.id
          );
          if (userReviewData) {
            setUserReview({
              id: userReviewData.id,
              rating: userReviewData.rating,
              review: userReviewData.review,
            });
          } else {
            setUserReview(undefined);
          }
        } catch (error) {
          console.error("Error fetching user review:", error);
        }
      }
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    scrollToTop();
  }, []);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id, user]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAddToCart = () => {
    if (product) {
      // Check if user is logged in
      if (!user) {
        setShowLoginModal(true);
        return;
      }

      for (let i = 0; i < quantity; i++) {
        addToCart({
          id: product.id,
          name: product.name,
          price: product.price,
          images: product.images,
          affiliatedLink: product.affiliatedLink,
          weight: product.weight,
        });
      }
      navigate("/checkout");
    }
  };

  const handleLogin = () => {
    setShowLoginModal(false);
    navigate("/login");
  };

  const handleContinueAsGuest = () => {
    if (product) {
      for (let i = 0; i < quantity; i++) {
        addToCart({
          id: product.id,
          name: product.name,
          price: product.price,
          images: product.images,
          affiliatedLink: product.affiliatedLink,
          weight: product.weight,
        });
      }
      setShowLoginModal(false);
      navigate("/checkout");
    }
  };

  const handleReviewSubmitted = () => {
    // Refresh product data and user review
    if (id) {
      fetchProduct();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Product not found
          </h2>
          <button
            onClick={() => navigate("/products")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate("/products")}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Products</span>
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
            {/* Product Image */}
            <div className="aspect-square rounded-lg overflow-hidden relative">
              <img
                src={product.images[0] || "/placeholder-image.png"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4">
                <FavoriteButton productId={product.id} size="lg" />
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {product.name}
                </h1>
                <p className="text-3xl font-bold text-blue-600">
                  £{product.price.toFixed(2)}
                </p>

                {/* Rating Display */}
                {product.reviewStats &&
                  product.reviewStats.totalReviews > 0 && (
                    <div className="flex items-center space-x-2 mt-2">
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-5 w-5 ${
                              star <=
                              Math.round(product.reviewStats!.averageRating)
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        {product.reviewStats.averageRating.toFixed(1)} (
                        {product.reviewStats.totalReviews} reviews)
                      </span>
                    </div>
                  )}
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Description
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Product Specifications */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <Package className="h-6 w-6 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Weight</p>
                    <p className="text-gray-600">{product.weight} kg</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <Package className="h-6 w-6 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Dimensions</p>
                    <p className="text-gray-600">{product.dimensions}</p>
                  </div>
                </div>
              </div>

              {/* Delivery Information */}
              <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                <Truck className="h-6 w-6 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">UK Delivery</p>
                  <p className="text-gray-600">
                    Fast delivery across the UK for £10
                  </p>
                </div>
              </div>

              {/* Quantity and Add to Cart */}
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="quantity"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Quantity
                  </label>
                  <select
                    id="quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    className="block w-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {[...Array(10)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center space-x-2 transition-colors transform hover:scale-105"
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span>Add to Cart</span>
                </button>
              </div>

              {/* Shipping Information */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Shipping Information
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Free returns within 30 days</li>
                  <li>• Secure packaging for safe delivery</li>
                  <li>• Track your order in real-time</li>
                  <li>• Customer support available 24/7</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Customer Reviews
          </h2>

          {/* Review Form - Only show if user has purchased this product */}
          <div className="mb-8">
            <ReviewForm
              productId={product.id}
              onReviewSubmitted={handleReviewSubmitted}
              existingReview={userReview}
            />
          </div>

          {/* Review List */}
          {product.reviewStats && (
            <ReviewList
              productId={product.id}
              reviewStats={product.reviewStats}
              onReviewSubmitted={handleReviewSubmitted}
            />
          )}
        </div>
      </div>

      {/* Login/Guest Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  Continue Shopping
                </h2>
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <p className="text-gray-600 mb-6">
                Please login to your account or continue as a guest to proceed
                with checkout.
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleLogin}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <LogIn className="h-5 w-5" />
                  <span>Login</span>
                </button>
                <button
                  onClick={handleContinueAsGuest}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <User className="h-5 w-5" />
                  <span>Continue as Guest</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
