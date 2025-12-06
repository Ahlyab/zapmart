import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, Star, ArrowRight, ShoppingCart } from "lucide-react";
import axios from "axios";
import { API_ENDPOINTS } from "../config/api";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";

interface Product {
  id: string;
  _id?: string;
  name: string;
  price: number;
  images: string[];
  description: string;
  category?: {
    _id: string;
    name: string;
  };
  reviewStats?: {
    totalReviews: number;
    averageRating: number;
  };
}

const FavoritesPage: React.FC = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchFavorites();
  }, [user]);

  const fetchFavorites = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(API_ENDPOINTS.FAVORITES, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const favoritesData = response.data.map((product: Product) => ({
        ...product,
        id: product._id || product.id,
      }));
      setFavorites(favoritesData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (productId: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_ENDPOINTS.FAVORITES}/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Remove from local state
      setFavorites(favorites.filter((p) => p.id !== productId));
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  };

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      images: product.images,
      description: product.description,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading your favorites...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            My Favorites
          </h1>
          <p className="text-lg text-gray-600">
            {favorites.length === 0
              ? "You haven't added any favorites yet"
              : `You have ${favorites.length} favorite product${favorites.length !== 1 ? "s" : ""}`}
          </p>
        </div>

        {/* Empty State */}
        {favorites.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-24 w-24 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No favorites yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start adding products to your favorites to see them here
            </p>
            <Link
              to="/products"
              className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Browse Products
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        ) : (
          /* Products Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((product) => (
              <div
                key={product.id}
                className="group bg-white rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="relative overflow-hidden">
                  <Link to={`/products/${product.id}`}>
                    <img
                      src={product.images[0] || "/placeholder-image.png"}
                      alt={product.name}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </Link>
                  <div className="absolute top-3 right-3">
                    <button
                      onClick={() => handleRemoveFavorite(product.id)}
                      className="bg-white/90 hover:bg-white p-2 rounded-full transition-colors"
                      title="Remove from favorites"
                    >
                      <Heart className="h-5 w-5 text-red-500 fill-current" />
                    </button>
                  </div>
                  {product.reviewStats && (
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-xs font-medium text-gray-700">
                        {product.reviewStats.averageRating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <Link to={`/products/${product.id}`}>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-gray-600 mb-4 text-sm line-clamp-2">
                    {product.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-blue-600">
                      £{product.price}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
                        title="Add to cart"
                      >
                        <ShoppingCart className="h-5 w-5" />
                      </button>
                      <Link
                        to={`/products/${product.id}`}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
                      >
                        View
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;

