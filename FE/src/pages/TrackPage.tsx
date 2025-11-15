import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  PackageSearch,
  Search,
  ArrowRight,
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import axios from "axios";
import { API_ENDPOINTS } from "../config/api";

interface OrderItem {
  product: {
    name: string;
    price: number;
    imageUrl?: string;
  };
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  trackingNumber: string;
  status: string;
  total: number;
  items: OrderItem[];
  shippingAddress: {
    street: string;
    city: string;
    country: string;
  };
  user: {
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  deliveryPartner?: string;
}

const TrackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [trackingId, setTrackingId] = useState(
    searchParams.get("trackingId") || ""
  );
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (trackingId) {
      handleTrack();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      case "shipped":
      case "handed to delivery partner":
        return <Truck className="h-6 w-6 text-blue-600" />;
      case "paid":
      case "preparing":
        return <Package className="h-6 w-6 text-yellow-600" />;
      case "cancelled":
        return <XCircle className="h-6 w-6 text-red-600" />;
      default:
        return <Clock className="h-6 w-6 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-800 border-green-300";
      case "shipped":
      case "handed to delivery partner":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "paid":
      case "preparing":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleTrack();
  };

  const handleTrack = async () => {
    if (!trackingId.trim()) {
      setError("Please enter a tracking number");
      return;
    }

    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      const response = await axios.get(
        `${API_ENDPOINTS.TRACK_ORDER}?trackingNumber=${trackingId}`
      );
      setOrder(response.data);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Order not found. Please check your tracking number."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-lg">
            <PackageSearch className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Track Your Order
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Enter your tracking ID to see the current status and location of
            your order
          </p>
        </div>

        {/* Tracking Form Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="trackingId"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Tracking ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="trackingId"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  placeholder="Enter your tracking ID (e.g., ZM123456789)"
                  className="w-full pl-12 pr-4 py-4 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-gray-50 focus:bg-white"
                  required
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                You can find your tracking ID in the confirmation email sent
                after your order was placed.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{loading ? "Tracking..." : "Track Order"}</span>
              {!loading && <ArrowRight className="h-5 w-5" />}
            </button>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Order Details */}
        {order && (
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 md:p-10 mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Order Details
            </h2>

            {/* Order Status */}
            <div className="mb-6">
              <div
                className={`flex items-center space-x-3 p-4 rounded-lg border-2 ${getStatusColor(
                  order.status
                )}`}
              >
                {getStatusIcon(order.status)}
                <div>
                  <p className="font-semibold">Status</p>
                  <p className="text-sm capitalize">
                    {order.status.replace(/-/g, " ")}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Order Information
                </h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-medium">Tracking Number:</span>{" "}
                    <span className="font-mono">{order.trackingNumber}</span>
                  </p>
                  <p>
                    <span className="font-medium">Order Date:</span>{" "}
                    {formatDate(order.createdAt)}
                  </p>
                  <p>
                    <span className="font-medium">Last Updated:</span>{" "}
                    {formatDate(order.updatedAt)}
                  </p>
                  <p>
                    <span className="font-medium">Total Amount:</span> £
                    {order.total.toFixed(2)}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Shipping Address
                </h3>
                <div className="space-y-2 text-sm">
                  <p>{order.shippingAddress.street}</p>
                  <p>{order.shippingAddress.city}</p>
                  <p>{order.shippingAddress.country}</p>
                </div>
              </div>
            </div>

            {/* Delivery Partner */}
            {order.deliveryPartner && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm">
                  <span className="font-medium">Delivery Partner:</span>{" "}
                  {order.deliveryPartner}
                </p>
              </div>
            )}

            {/* Order Items */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Order Items
              </h3>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                  >
                    {item.product.imageUrl && (
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {item.product.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold text-gray-900">
                      £{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-8 sm:mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <PackageSearch className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Where to Find It
            </h3>
            <p className="text-sm text-gray-600">
              Check your order confirmation email or your account dashboard for
              the tracking ID.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <Search className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Real-Time Updates
            </h3>
            <p className="text-sm text-gray-600">
              Get instant updates on your order status and delivery location as
              it moves.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <ArrowRight className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Need Help?
            </h3>
            <p className="text-sm text-gray-600">
              If you can't find your tracking ID or have questions, contact our
              support team.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackPage;
