// API Configuration
export const API_BASE_URL = import.meta.env.VITE_BACKEND || 'http://localhost:3001';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  PROFILE: `${API_BASE_URL}/api/auth/profile`,
  
  // Products
  PRODUCTS: `${API_BASE_URL}/api/products`,
  CATEGORIES: `${API_BASE_URL}/api/categories`,
  
  // Orders
  ORDERS: `${API_BASE_URL}/api/orders`,
  SELLER_ORDERS: `${API_BASE_URL}/api/orders/seller/orders`,
  CREATE_PAYMENT_INTENT: `${API_BASE_URL}/api/create-payment-intent`,
  
  // Admin
  ADMIN_STATS: `${API_BASE_URL}/api/admin/stats`,
  ADMIN_USERS: `${API_BASE_URL}/api/admin/users`,
  ADMIN_PRODUCTS: `${API_BASE_URL}/api/admin/products`,
  ADMIN_ORDERS: `${API_BASE_URL}/api/admin/orders`,
  
  // Seller
  SELLER_PRODUCTS: `${API_BASE_URL}/api/seller/products`,
  
  // Reviews
  REVIEWS: `${API_BASE_URL}/api/reviews`,
};

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
}; 