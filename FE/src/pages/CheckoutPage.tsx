import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { Minus, Plus, Trash2, CheckCircle } from "lucide-react";
import StripeCheckout from "../components/StripeCheckout";
import { API_ENDPOINTS } from "../config/api";

const CheckoutPage: React.FC = () => {
  const { items, updateQuantity, removeFromCart, getTotalPrice, clearCart } =
    useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || "",
    address: "",
    city: "",
    country: "United Kingdom",
  });
  const [guestInfo, setGuestInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
  });
  const [paymentStatus, setPaymentStatus] = useState<
    "pending" | "success" | "error"
  >("pending");
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [trackingNumber, setTrackingNumber] = useState<string | null>(null);
  const [guestToken, setGuestToken] = useState<string | null>(null);
  const [isCreatingGuestAccount, setIsCreatingGuestAccount] = useState(false);

  const deliveryCharge = 10;
  const subtotal = getTotalPrice();
  const total = subtotal + deliveryCharge;

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(id);
    } else {
      updateQuantity(id, newQuantity);
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShippingAddress({
      ...shippingAddress,
      [e.target.name]: e.target.value,
    });
  };

  const handleGuestInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGuestInfo({
      ...guestInfo,
      [e.target.name]: e.target.value,
    });
    // Reset guest token when guest info changes
    setGuestToken(null);
  };

  // Create guest account when guest info is filled (before payment)
  const createGuestAccount = async () => {
    if (!guestInfo.fullName || !guestInfo.email || !guestInfo.phone) {
      return null;
    }

    try {
      setIsCreatingGuestAccount(true);
      const response = await fetch(API_ENDPOINTS.GUEST_AUTH, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          guestInfo: {
            fullName: guestInfo.fullName,
            email: guestInfo.email,
            phone: guestInfo.phone,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create guest account");
      }

      const data = await response.json();
      setGuestToken(data.token);
      return data.token;
    } catch (error) {
      console.error("Error creating guest account:", error);
      setPaymentError("Failed to create guest account. Please try again.");
      setPaymentStatus("error");
      return null;
    } finally {
      setIsCreatingGuestAccount(false);
    }
  };

  // Effect to create guest account when guest info is complete
  useEffect(() => {
    if (
      !user &&
      guestInfo.fullName &&
      guestInfo.email &&
      guestInfo.phone &&
      !guestToken &&
      !isCreatingGuestAccount
    ) {
      createGuestAccount();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guestInfo.fullName, guestInfo.email, guestInfo.phone, user, guestToken]);

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    try {
      // Transform cart items to match Order model schema
      const orderItems = items.map((item) => ({
        product: item.id, // This should be the product ObjectId
        quantity: item.quantity,
        price: item.price,
      }));

      // Transform shipping address to match Order model schema
      const orderShippingAddress = {
        street: shippingAddress.address,
        city: shippingAddress.city,
        country: shippingAddress.country,
      };

      // Use guest checkout endpoint (unprotected) if user is not logged in
      // GUEST_ORDERS endpoint does not require authentication
      const endpoint = user ? API_ENDPOINTS.ORDERS : API_ENDPOINTS.GUEST_ORDERS;
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      // Add auth token only if user is logged in (not needed for guest checkout)
      if (user) {
        headers.Authorization = `Bearer ${localStorage.getItem("token")}`;
      }

      const requestBody: any = {
        items: orderItems,
        shippingAddress: orderShippingAddress,
        total,
        paymentIntentId,
      };

      // Add guest info if not logged in
      if (!user) {
        requestBody.guestInfo = {
          fullName: guestInfo.fullName,
          email: guestInfo.email,
          phone: guestInfo.phone,
        };
      }

      // Create order with payment intent ID
      const response = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error("Failed to create order");
      }

      const orderData = await response.json();
      setPaymentStatus("success");
      setShowSuccessModal(true);
      clearCart();

      // Store tracking number for guest users
      if (!user && orderData.trackingNumber) {
        setTrackingNumber(orderData.trackingNumber);
        localStorage.setItem("lastTrackingNumber", orderData.trackingNumber);
      }
    } catch {
      setPaymentError("Failed to create order. Please contact support.");
      setPaymentStatus("error");
    }
  };

  const handlePaymentError = (error: string) => {
    setPaymentError(error);
    setPaymentStatus("error");
  };

  // Auto-redirect to home page after 3 seconds when payment is successful
  useEffect(() => {
    if (showSuccessModal) {
      setCountdown(3);
      const countdownTimer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownTimer);
            navigate("/");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdownTimer);
    }
  }, [showSuccessModal, navigate]);

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    navigate("/");
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Your cart is empty
            </h2>
            <p className="text-gray-600 mb-6">
              Add some products to your cart to continue shopping.
            </p>
            <button
              onClick={() => navigate("/products")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">
          Shopping Cart & Checkout
        </h1>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Cart Items */}
          <div className="xl:col-span-2 order-2 xl:order-1">
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Cart Items ({items.length})
                </h2>
              </div>

              <div className="p-4 sm:p-6 space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 border-b border-gray-200 pb-4"
                  >
                    <img
                      src={item.images[0] || "/placeholder-image.png"}
                      alt={item.name}
                      className="w-20 h-20 sm:w-16 sm:h-16 object-cover rounded-md flex-shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-medium text-gray-900 truncate">
                        {item.name}
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600">
                        £{item.price.toFixed(2)} each
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500">
                        Weight: {item.weight}kg
                      </p>
                    </div>

                    <div className="flex items-center justify-between w-full sm:w-auto sm:justify-center space-x-4 sm:space-x-2">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity - 1)
                          }
                          className="p-1 rounded-md hover:bg-gray-100 transition-colors"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity + 1)
                          }
                          className="p-1 rounded-md hover:bg-gray-100 transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="flex items-center space-x-2">
                        <p className="text-base sm:text-lg font-semibold text-gray-900">
                          £{(item.price * item.quantity).toFixed(2)}
                        </p>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Guest Information */}
            {!user && (
              <div className="bg-white rounded-lg shadow-md mt-4 sm:mt-6">
                <div className="p-4 sm:p-6 border-b border-gray-200">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                    Guest Information
                  </h2>
                </div>

                <div className="p-4 sm:p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={guestInfo.fullName}
                      onChange={handleGuestInfoChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={guestInfo.email}
                      onChange={handleGuestInfoChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Enter your email"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={guestInfo.phone}
                      onChange={handleGuestInfoChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-md mt-4 sm:mt-6">
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Shipping Address
                </h2>
              </div>

              <div className="p-4 sm:p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={shippingAddress.fullName}
                      onChange={handleAddressChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={shippingAddress.country}
                      onChange={handleAddressChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                      readOnly
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={shippingAddress.address}
                    onChange={handleAddressChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter your full address"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={shippingAddress.city}
                    onChange={handleAddressChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter your city"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="xl:col-span-1 order-1 xl:order-2">
            <div className="bg-white rounded-lg shadow-md xl:sticky xl:top-4">
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Order Summary
                </h2>
              </div>

              <div className="p-4 sm:p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-900">
                    £{subtotal.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">UK Delivery</span>
                  <span className="font-medium text-gray-900">
                    £{deliveryCharge.toFixed(2)}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900">£{total.toFixed(2)}</span>
                  </div>
                </div>

                {paymentStatus === "success" ? (
                  <div className="text-center py-4 sm:py-6">
                    <div className="animate-pulse">
                      <CheckCircle className="h-12 w-12 sm:h-16 sm:w-16 text-green-500 mx-auto mb-4" />
                      <h3 className="text-base sm:text-lg font-semibold text-green-800 mb-2">
                        Processing...
                      </h3>
                      <p className="text-green-600 text-sm sm:text-base">
                        Your payment is being processed.
                      </p>
                    </div>
                  </div>
                ) : paymentStatus === "error" ? (
                  <div className="text-center py-4 sm:py-6">
                    <div className="text-red-500 mb-4">
                      <svg
                        className="h-12 w-12 sm:h-16 sm:w-16 mx-auto"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-red-800 mb-2">
                      Payment Failed
                    </h3>
                    <p className="text-red-600 mb-4 text-sm sm:text-base">
                      {paymentError}
                    </p>
                    <button
                      onClick={() => setPaymentStatus("pending")}
                      className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {!user && isCreatingGuestAccount && (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p className="text-sm text-gray-600">Setting up guest account...</p>
                      </div>
                    )}
                    <StripeCheckout
                      amount={total}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                      disabled={
                        !shippingAddress.address ||
                        !shippingAddress.city ||
                        (!user &&
                          (!guestInfo.fullName ||
                            !guestInfo.email ||
                            !guestInfo.phone ||
                            !guestToken ||
                            isCreatingGuestAccount))
                      }
                      guestToken={!user ? guestToken : null}
                    />
                  </div>
                )}

                <div className="text-xs text-gray-500 text-center space-y-1 pt-4 border-t border-gray-100">
                  <p className="flex items-center justify-center space-x-1">
                    <span>💳</span>
                    <span>Secure payment with Stripe</span>
                  </p>
                  <p className="flex items-center justify-center space-x-1">
                    <span>🚚</span>
                    <span>Fast delivery across the UK</span>
                  </p>
                  <p className="flex items-center justify-center space-x-1">
                    <span>🔒</span>
                    <span>Your data is protected</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100 animate-in fade-in-0 zoom-in-95">
            <div className="p-6 sm:p-8 text-center">
              {/* Success Animation */}
              <div className="mb-6">
                <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-bounce">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <div className="w-16 h-1 bg-green-200 rounded-full mx-auto mb-2"></div>
                <div className="w-12 h-1 bg-green-300 rounded-full mx-auto"></div>
              </div>

              {/* Success Message */}
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                Payment Successful! 🎉
              </h2>
              <p className="text-gray-600 mb-6 text-sm sm:text-base">
                Your order has been placed successfully. You will receive a
                confirmation email shortly.
              </p>

              {/* Tracking Number for Guest Users */}
              {!user && trackingNumber && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                  <h3 className="text-sm sm:text-base font-semibold text-blue-800 mb-2">
                    Your Tracking Number
                  </h3>
                  <p className="text-blue-700 text-xs sm:text-sm mb-3">
                    Use this tracking number to track your order status:
                  </p>
                  <div className="bg-white border border-blue-300 rounded-lg p-3 mb-3">
                    <p className="text-lg font-mono font-bold text-blue-900 text-center">
                      {trackingNumber}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowSuccessModal(false);
                      navigate(`/track?trackingId=${trackingNumber}`);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors w-full"
                  >
                    Track Your Order
                  </button>
                </div>
              )}

              {/* Review Prompt */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <h3 className="text-sm sm:text-base font-semibold text-blue-800 mb-2">
                  Share Your Experience!
                </h3>
                <p className="text-blue-700 text-xs sm:text-sm mb-3">
                  Help other customers by reviewing the products you just
                  purchased.
                </p>
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    if (items.length > 0) {
                      navigate(`/products/${items[0].id}`);
                    } else {
                      navigate("/products");
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors w-full sm:w-auto"
                >
                  Leave a Review
                </button>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 sm:space-y-0 sm:space-x-3 sm:flex sm:justify-center">
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    navigate("/products");
                  }}
                  className="w-full sm:w-auto bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Continue Shopping
                </button>
                <button
                  onClick={handleCloseModal}
                  className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Go to Home
                </button>
              </div>

              {/* Auto-redirect countdown */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Redirecting to home page in{" "}
                  <span className="font-semibold text-green-600 animate-pulse">
                    {countdown}
                  </span>{" "}
                  seconds...
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
