import React, { useState, useEffect } from "react";
import {
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  Check,
  X,
  Trash2,
  Eye,
} from "lucide-react";
import axios from "axios";
import { API_ENDPOINTS } from "../config/api";

interface Stats {
  totalCustomers: number;
  totalSellers: number;
  pendingSellers: number;
  bannedUsers: number;
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalCategories: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isApproved: boolean;
  isBanned: boolean;
  createdAt: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  sellerId: string;
  sellerName: string;
  sellerEmail: string;
  isActive: boolean;
  createdAt: string;
}

interface Transaction {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerRole: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    images: string[];
    weight: number;
    quantity: number;
  }>;
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    country: string;
  };
  total: number;
  status: string;
  paymentIntentId: string;
  createdAt: string;
}

interface OrderDetails {
  id: string;
  userId: string;
  customer: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
  items: Array<{
    id: string;
    name: string;
    price: number;
    images: string[];
    weight: number;
    quantity: number;
    productDetails: {
      id: string;
      name: string;
      description: string;
      category: string;
      sellerId: string;
      isActive: boolean;
    } | null;
  }>;
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    country: string;
  };
  total: number;
  status: string;
  paymentIntentId: string;
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt?: string;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    totalCustomers: 0,
    totalSellers: 0,
    pendingSellers: 0,
    bannedUsers: 0,
    totalProducts: 0,
    activeProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalCategories: 0,
  });
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetails | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState<
    "overview" | "users" | "products" | "transactions" | "categories"
  >("overview");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          statsResponse,
          usersResponse,
          productsResponse,
          transactionsResponse,
          categoriesResponse,
        ] = await Promise.all([
          axios.get(API_ENDPOINTS.ADMIN_STATS),
          axios.get(API_ENDPOINTS.ADMIN_USERS),
          axios.get(API_ENDPOINTS.ADMIN_PRODUCTS),
          axios.get(API_ENDPOINTS.ADMIN_TRANSACTIONS),
          axios.get(API_ENDPOINTS.ADMIN_CATEGORIES),
        ]);

        console.log("user response = ", usersResponse);

        setStats({
          ...statsResponse.data,
          totalCategories: categoriesResponse.data.length,
        });
        console.log("Admin transactions", usersResponse.data);
        setUsers(usersResponse.data);
        setProducts(productsResponse.data);
        setTransactions(transactionsResponse.data);
        setCategories(categoriesResponse.data);
        setFilteredProducts(productsResponse.data);
        setFilteredUsers(usersResponse.data);
        setFilteredTransactions(transactionsResponse.data);
        setFilteredCategories(categoriesResponse.data);
      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter based on active tab and search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProducts(products);
      setFilteredUsers(users);
      setFilteredTransactions(transactions);
      setFilteredCategories(categories);
      return;
    }

    if (activeTab === "products") {
      const filtered = products.filter((product) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          product.name.toLowerCase().includes(searchLower) ||
          product.id.toLowerCase().includes(searchLower) ||
          product.sellerName.toLowerCase().includes(searchLower) ||
          product.sellerEmail.toLowerCase().includes(searchLower)
        );
      });
      setFilteredProducts(filtered);
    } else if (activeTab === "users") {
      const filtered = users.filter((user) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          user.name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower) ||
          user.role.toLowerCase().includes(searchLower)
        );
      });
      setFilteredUsers(filtered);
    } else if (activeTab === "transactions") {
      const filtered = transactions.filter((transaction) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          transaction.id.toLowerCase().includes(searchLower) ||
          transaction.customerName.toLowerCase().includes(searchLower) ||
          transaction.customerEmail.toLowerCase().includes(searchLower) ||
          transaction.status.toLowerCase().includes(searchLower) ||
          transaction.paymentIntentId.toLowerCase().includes(searchLower)
        );
      });
      setFilteredTransactions(filtered);
    } else if (activeTab === "categories") {
      const filtered = categories.filter((category) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          category.name.toLowerCase().includes(searchLower) ||
          category.description.toLowerCase().includes(searchLower) ||
          category.id.toLowerCase().includes(searchLower)
        );
      });
      setFilteredCategories(filtered);
    }
  }, [searchTerm, products, users, transactions, categories, activeTab]);

  const approveSeller = async (userId: string) => {
    try {
      await axios.put(`${API_ENDPOINTS.ADMIN_USERS}/${userId}/approve`);
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, isApproved: true } : user
        )
      );
      setStats({ ...stats, pendingSellers: stats.pendingSellers - 1 });
    } catch (error) {
      console.error("Error approving seller:", error);
    }
  };

  const toggleBanUser = async (userId: string, isBanned: boolean) => {
    try {
      await axios.put(`${API_ENDPOINTS.ADMIN_USERS}/${userId}/ban`, {
        isBanned,
      });
      setUsers(
        users.map((user) => (user.id === userId ? { ...user, isBanned } : user))
      );
      setStats({
        ...stats,
        bannedUsers: stats.bannedUsers + (isBanned ? 1 : -1),
      });
    } catch (error) {
      console.error("Error toggling user ban status:", error);
    }
  };

  const deleteUser = async (userId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      try {
        await axios.delete(`${API_ENDPOINTS.ADMIN_USERS}/${userId}`);

        // Remove user from local state
        const deletedUser = users.find((u) => u.id === userId);
        setUsers(users.filter((u) => u.id !== userId));
        setFilteredUsers(filteredUsers.filter((u) => u.id !== userId));

        // Update stats
        if (deletedUser) {
          const newStats = { ...stats };
          if (deletedUser.role === "customer") {
            newStats.totalCustomers -= 1;
          } else if (deletedUser.role === "seller") {
            newStats.totalSellers -= 1;
            if (!deletedUser.isApproved) {
              newStats.pendingSellers -= 1;
            }
          }
          if (deletedUser.isBanned) {
            newStats.bannedUsers -= 1;
          }
          setStats(newStats);
        }
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  const deleteProduct = async (productId: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(`${API_ENDPOINTS.PRODUCTS}/${productId}`);
        const updatedProducts = products.filter((p) => p.id !== productId);
        setProducts(updatedProducts);
        setFilteredProducts(filteredProducts.filter((p) => p.id !== productId));
        setStats({
          ...stats,
          totalProducts: stats.totalProducts - 1,
          activeProducts:
            stats.activeProducts -
            (products.find((p) => p.id === productId)?.isActive ? 1 : 0),
        });
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  const fetchOrderDetails = async (orderId: string) => {
    try {
      const response = await axios.get(
        `${API_ENDPOINTS.ADMIN_ORDERS}/${orderId}`
      );
      setSelectedOrder(response.data);
    } catch (error) {
      console.error("Error fetching order details:", error);
    }
  };

  const closeOrderDetails = () => {
    setSelectedOrder(null);
  };

  // Category management functions
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
  });

  const openCategoryModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({
        name: category.name,
        description: category.description,
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({ name: "", description: "" });
    }
    setShowCategoryModal(true);
  };

  const closeCategoryModal = () => {
    setShowCategoryModal(false);
    setEditingCategory(null);
    setCategoryForm({ name: "", description: "" });
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!categoryForm.name.trim() || !categoryForm.description.trim()) {
      alert("Name and description are required");
      return;
    }

    try {
      if (editingCategory) {
        // Update existing category
        const response = await axios.put(
          `${API_ENDPOINTS.ADMIN_CATEGORIES}/${editingCategory.id}`,
          categoryForm
        );
        setCategories(
          categories.map((cat) =>
            cat.id === editingCategory.id ? response.data : cat
          )
        );
        setFilteredCategories(
          filteredCategories.map((cat) =>
            cat.id === editingCategory.id ? response.data : cat
          )
        );
      } else {
        // Create new category
        const response = await axios.post(
          API_ENDPOINTS.ADMIN_CATEGORIES,
          categoryForm
        );
        setCategories([...categories, response.data]);
        setFilteredCategories([...filteredCategories, response.data]);
        setStats({ ...stats, totalCategories: stats.totalCategories + 1 });
      }
      closeCategoryModal();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message || "Error saving category"
          : "Error saving category";
      alert(errorMessage);
    }
  };

  const deleteCategory = async (categoryId: string) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await axios.delete(
          `${API_ENDPOINTS.ADMIN_CATEGORIES}/${categoryId}`
        );
        setCategories(categories.filter((cat) => cat.id !== categoryId));
        setFilteredCategories(
          filteredCategories.filter((cat) => cat.id !== categoryId)
        );
        setStats({ ...stats, totalCategories: stats.totalCategories - 1 });
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error && "response" in error
            ? (error as { response?: { data?: { message?: string } } }).response
                ?.data?.message || "Error deleting category"
            : "Error deleting category";
        alert(errorMessage);
      }
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your zapmart platform</p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => {
                  setActiveTab("overview");
                  setSearchTerm("");
                }}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "overview"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => {
                  setActiveTab("users");
                  setSearchTerm("");
                }}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "users"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Users (
                {stats.pendingSellers > 0 ? (
                  <span className="text-red-500">{stats.pendingSellers}</span>
                ) : (
                  <span className="text-black">0</span>
                )}
                )
              </button>
              <button
                onClick={() => {
                  setActiveTab("products");
                  setSearchTerm("");
                }}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "products"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Products
              </button>
              <button
                onClick={() => {
                  setActiveTab("transactions");
                  setSearchTerm("");
                }}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "transactions"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Transactions
              </button>
              <button
                onClick={() => {
                  setActiveTab("categories");
                  setSearchTerm("");
                }}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "categories"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Categories
              </button>
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Customers
                    </h3>
                    <p className="text-2xl font-bold text-blue-600">
                      {stats.totalCustomers}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="bg-green-100 p-3 rounded-full">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Sellers
                    </h3>
                    <p className="text-2xl font-bold text-green-600">
                      {stats.totalSellers}
                    </p>
                    {stats.pendingSellers > 0 && (
                      <p className="text-sm text-red-600">
                        {stats.pendingSellers} pending
                      </p>
                    )}
                    {stats.bannedUsers > 0 && (
                      <p className="text-sm text-red-600">
                        {stats.bannedUsers} banned
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="bg-purple-100 p-3 rounded-full">
                    <Package className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Products
                    </h3>
                    <p className="text-2xl font-bold text-purple-600">
                      {stats.totalProducts}
                    </p>
                    <p className="text-sm text-gray-600">
                      {stats.activeProducts} active
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="bg-orange-100 p-3 rounded-full">
                    <DollarSign className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Revenue
                    </h3>
                    <p className="text-2xl font-bold text-orange-600">
                      £{stats.totalRevenue.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {stats.totalOrders} orders
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="bg-indigo-100 p-3 rounded-full">
                    <Package className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Categories
                    </h3>
                    <p className="text-2xl font-bold text-indigo-600">
                      {stats.totalCategories}
                    </p>
                    <p className="text-sm text-gray-600">Product categories</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Platform Overview
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Quick Stats
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Users</span>
                        <span className="font-semibold">
                          {stats.totalCustomers + stats.totalSellers}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Active Products</span>
                        <span className="font-semibold">
                          {stats.activeProducts}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Categories</span>
                        <span className="font-semibold">
                          {stats.totalCategories}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pending Approvals</span>
                        <span className="font-semibold text-red-600">
                          {stats.pendingSellers}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Platform Health
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">
                          User Approval Rate
                        </span>
                        <span className="text-green-600 font-semibold">
                          {stats.totalSellers > 0
                            ? (
                                ((stats.totalSellers - stats.pendingSellers) /
                                  stats.totalSellers) *
                                100
                              ).toFixed(1)
                            : 0}
                          %
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">
                          Product Activation Rate
                        </span>
                        <span className="text-green-600 font-semibold">
                          {stats.totalProducts > 0
                            ? (
                                (stats.activeProducts / stats.totalProducts) *
                                100
                              ).toFixed(1)
                            : 0}
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 sm:mb-0">
                  User Management
                </h2>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by user name, email, or role..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {filteredUsers.length} of {users.length} users
                  {searchTerm && (
                    <span className="ml-2 text-blue-600">
                      matching "{searchTerm}"
                    </span>
                  )}
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="text-sm text-gray-500 hover:text-gray-700 underline"
                  >
                    Clear search
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Approval Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ban Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.role === "admin"
                                ? "bg-purple-100 text-purple-800"
                                : user.role === "seller"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {user.role.charAt(0).toUpperCase() +
                              user.role.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.isApproved
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {user.isApproved ? "Approved" : "Pending"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.isBanned
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {user.isBanned ? "Banned" : "Active"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            {user.role === "seller" && !user.isApproved && (
                              <button
                                onClick={() => approveSeller(user.id)}
                                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Approve
                              </button>
                            )}
                            {user.role !== "admin" && (
                              <>
                                <button
                                  onClick={() =>
                                    toggleBanUser(user.id, !user.isBanned)
                                  }
                                  className={`inline-flex items-center px-3 py-1 border text-sm font-medium rounded-md ${
                                    user.isBanned
                                      ? "border-green-300 text-green-700 bg-green-50 hover:bg-green-100"
                                      : "border-red-300 text-red-700 bg-red-50 hover:bg-red-100"
                                  }`}
                                >
                                  {user.isBanned ? (
                                    <>
                                      <Check className="h-4 w-4 mr-1" />
                                      Unban
                                    </>
                                  ) : (
                                    <>
                                      <X className="h-4 w-4 mr-1" />
                                      Ban
                                    </>
                                  )}
                                </button>
                                <button
                                  onClick={() => deleteUser(user.id)}
                                  className="inline-flex items-center px-3 py-1 border border-red-300 text-red-700 bg-red-50 hover:bg-red-100 text-sm font-medium rounded-md"
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        <div className="flex flex-col items-center">
                          <Users className="h-12 w-12 text-gray-400 mb-4" />
                          <p className="text-lg font-medium">
                            {searchTerm
                              ? "No users found matching your search"
                              : "No users found"}
                          </p>
                          <p className="text-sm">
                            {searchTerm
                              ? "Try adjusting your search terms or clear the search to see all users."
                              : "Users will appear here once they register on the platform."}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === "products" && (
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 sm:mb-0">
                  Product Management
                </h2>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by product name, ID, seller name, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {filteredProducts.length} of {products.length} products
                  {searchTerm && (
                    <span className="ml-2 text-blue-600">
                      matching "{searchTerm}"
                    </span>
                  )}
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="text-sm text-gray-500 hover:text-gray-700 underline"
                  >
                    Clear search
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Seller
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-16 w-16">
                              <img
                                className="h-16 w-16 rounded-lg object-cover"
                                src={
                                  product.images[0] || "/placeholder-image.png"
                                }
                                alt={product.name}
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {product.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {product.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-blue-600">
                            £{product.price}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {product.sellerName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {product.sellerEmail}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              product.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {product.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(product.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => deleteProduct(product.id)}
                            className="inline-flex items-center px-3 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        <div className="flex flex-col items-center">
                          <Package className="h-12 w-12 text-gray-400 mb-4" />
                          <p className="text-lg font-medium">
                            {searchTerm
                              ? "No products found matching your search"
                              : "No products found"}
                          </p>
                          <p className="text-sm">
                            {searchTerm
                              ? "Try adjusting your search terms or clear the search to see all products."
                              : "Products will appear here once they are added to the platform."}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === "transactions" && (
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 sm:mb-0">
                  Transaction Management
                </h2>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by order ID, customer name, email, or status..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {filteredTransactions.length} of {transactions.length}{" "}
                  transactions
                  {searchTerm && (
                    <span className="ml-2 text-blue-600">
                      matching "{searchTerm}"
                    </span>
                  )}
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="text-sm text-gray-500 hover:text-gray-700 underline"
                  >
                    Clear search
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            #{transaction.id}
                          </div>
                          <div className="text-sm text-gray-500">
                            Payment: {transaction.paymentIntentId}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {transaction.customerName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {transaction.customerEmail}
                            </div>
                            <div className="text-xs text-gray-400">
                              {transaction.customerRole}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {transaction.items.length} item
                            {transaction.items.length !== 1 ? "s" : ""}
                          </div>
                          <div className="text-sm text-gray-500">
                            {transaction.items
                              .map((item) => item.name)
                              .join(", ")}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-green-600">
                            £{transaction.total}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              transaction.status === "paid"
                                ? "bg-green-100 text-green-800"
                                : transaction.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {transaction.status.charAt(0).toUpperCase() +
                              transaction.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => fetchOrderDetails(transaction.id)}
                            className="inline-flex items-center px-3 py-2 border border-blue-300 text-blue-700 rounded-md hover:bg-blue-50 transition-colors"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        <div className="flex flex-col items-center">
                          <ShoppingCart className="h-12 w-12 text-gray-400 mb-4" />
                          <p className="text-lg font-medium">
                            {searchTerm
                              ? "No transactions found matching your search"
                              : "No transactions found"}
                          </p>
                          <p className="text-sm">
                            {searchTerm
                              ? "Try adjusting your search terms or clear the search to see all transactions."
                              : "Transactions will appear here once customers make purchases."}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === "categories" && (
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 sm:mb-0">
                  Category Management
                </h2>
                <div className="flex space-x-3">
                  <button
                    onClick={() => openCategoryModal()}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Add Category
                  </button>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search by category name, description, or ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full sm:w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {filteredCategories.length} of {categories.length} categories
                  {searchTerm && (
                    <span className="ml-2 text-blue-600">
                      matching "{searchTerm}"
                    </span>
                  )}
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="text-sm text-gray-500 hover:text-gray-700 underline"
                  >
                    Clear search
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCategories.length > 0 ? (
                    filteredCategories.map((category) => (
                      <tr key={category.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {category.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {category.id}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {category.description}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(category.createdAt).toLocaleDateString()}
                          {category.updatedAt && (
                            <div className="text-xs text-gray-400">
                              Updated:{" "}
                              {new Date(
                                category.updatedAt
                              ).toLocaleDateString()}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openCategoryModal(category)}
                              className="inline-flex items-center px-3 py-2 border border-blue-300 text-blue-700 rounded-md hover:bg-blue-50 transition-colors"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Edit
                            </button>
                            <button
                              onClick={() => deleteCategory(category.id)}
                              className="inline-flex items-center px-3 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        <div className="flex flex-col items-center">
                          <Package className="h-12 w-12 text-gray-400 mb-4" />
                          <p className="text-lg font-medium">
                            {searchTerm
                              ? "No categories found matching your search"
                              : "No categories found"}
                          </p>
                          <p className="text-sm">
                            {searchTerm
                              ? "Try adjusting your search terms or clear the search to see all categories."
                              : "Categories will appear here once they are added to the platform."}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Order Details
                  </h3>
                  <button
                    onClick={closeOrderDetails}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Order Header */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Order ID
                        </p>
                        <p className="text-sm text-gray-900">
                          #{selectedOrder.id}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Status
                        </p>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            selectedOrder.status === "paid"
                              ? "bg-green-100 text-green-800"
                              : selectedOrder.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {selectedOrder.status.charAt(0).toUpperCase() +
                            selectedOrder.status.slice(1)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Total Amount
                        </p>
                        <p className="text-lg font-bold text-green-600">
                          £{selectedOrder.total}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Date
                        </p>
                        <p className="text-sm text-gray-900">
                          {new Date(
                            selectedOrder.createdAt
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Customer Information */}
                  {selectedOrder.customer && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-blue-900 mb-2">
                        Customer Information
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-blue-700">
                            Name
                          </p>
                          <p className="text-sm text-blue-900">
                            {selectedOrder.customer.name}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-blue-700">
                            Email
                          </p>
                          <p className="text-sm text-blue-900">
                            {selectedOrder.customer.email}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-blue-700">
                            Role
                          </p>
                          <p className="text-sm text-blue-900">
                            {selectedOrder.customer.role}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-blue-700">
                            Customer ID
                          </p>
                          <p className="text-sm text-blue-900">
                            {selectedOrder.customer.id}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Shipping Address */}
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-green-900 mb-2">
                      Shipping Address
                    </h4>
                    <div className="space-y-1">
                      <p className="text-sm text-green-900">
                        {selectedOrder.shippingAddress.fullName}
                      </p>
                      <p className="text-sm text-green-900">
                        {selectedOrder.shippingAddress.address}
                      </p>
                      <p className="text-sm text-green-900">
                        {selectedOrder.shippingAddress.city},{" "}
                        {selectedOrder.shippingAddress.country}
                      </p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                      Order Items
                    </h4>
                    <div className="space-y-3">
                      {selectedOrder.items.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-shrink-0 h-16 w-16">
                            <img
                              className="h-16 w-16 rounded-lg object-cover"
                              src={item.images[0] || "/placeholder-image.png"}
                              alt={item.name}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              {item.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              Quantity: {item.quantity}
                            </p>
                            <p className="text-sm text-gray-500">
                              Weight: {item.weight}kg
                            </p>
                            <p className="text-sm font-bold text-blue-600">
                              £{item.price}
                            </p>
                            {item.productDetails && (
                              <div className="mt-2 text-xs text-gray-500">
                                <p>Category: {item.productDetails.category}</p>
                                <p>Seller ID: {item.productDetails.sellerId}</p>
                                <p>
                                  Status:{" "}
                                  {item.productDetails.isActive
                                    ? "Active"
                                    : "Inactive"}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment Information */}
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-purple-900 mb-2">
                      Payment Information
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-purple-700">
                          Payment Intent ID
                        </p>
                        <p className="text-sm text-purple-900 font-mono">
                          {selectedOrder.paymentIntentId}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-purple-700">
                          Payment Status
                        </p>
                        <p className="text-sm text-purple-900">
                          {selectedOrder.status}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={closeOrderDetails}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Category Modal */}
        {showCategoryModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 lg:w-1/3 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {editingCategory ? "Edit Category" : "Add New Category"}
                  </h3>
                  <button
                    onClick={closeCategoryModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleCategorySubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="categoryName"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Category Name
                    </label>
                    <input
                      type="text"
                      id="categoryName"
                      value={categoryForm.name}
                      onChange={(e) =>
                        setCategoryForm({
                          ...categoryForm,
                          name: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter category name"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="categoryDescription"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Description
                    </label>
                    <textarea
                      id="categoryDescription"
                      value={categoryForm.description}
                      onChange={(e) =>
                        setCategoryForm({
                          ...categoryForm,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter category description"
                      required
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={closeCategoryModal}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      {editingCategory ? "Update Category" : "Create Category"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
