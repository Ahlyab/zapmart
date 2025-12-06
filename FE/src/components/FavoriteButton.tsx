import React, { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import axios from "axios";
import { API_ENDPOINTS } from "../config/api";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface FavoriteButtonProps {
  productId: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  productId,
  className = "",
  size = "md",
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user && productId) {
      checkFavorite();
    }
  }, [user, productId]);

  const checkFavorite = async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_ENDPOINTS.FAVORITES}/check/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setIsFavorite(response.data.isFavorite);
    } catch (error) {
      console.error("Error checking favorite:", error);
    }
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate("/login");
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (isFavorite) {
        // Remove from favorites
        await axios.delete(`${API_ENDPOINTS.FAVORITES}/${productId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setIsFavorite(false);
      } else {
        // Add to favorites
        await axios.post(
          API_ENDPOINTS.FAVORITES,
          { productId },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setIsFavorite(true);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  return (
    <button
      onClick={handleToggleFavorite}
      disabled={isLoading}
      className={`bg-white/90 hover:bg-white p-2 rounded-full transition-colors ${className}`}
      title={isFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart
        className={`${sizeClasses[size]} ${
          isFavorite
            ? "text-red-500 fill-current"
            : "text-gray-600 hover:text-red-500"
        } transition-colors`}
      />
    </button>
  );
};

export default FavoriteButton;

