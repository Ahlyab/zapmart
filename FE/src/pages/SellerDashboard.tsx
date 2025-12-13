import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  Plus,
  Package,
  DollarSign,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  ShoppingBag,
  X,
} from "lucide-react";
import axios from "axios";
import { API_ENDPOINTS } from "../config/api";
import SellerOrdersManager from "../components/SellerOrdersManager";
import MarkdownEditor from "../components/MarkdownEditor";

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  description: string;
  weight: number;
  dimensions: string;
  category: string; // This should be the category ID
  colors?: string[];
  sizes?: string[];
  affiliatedLink?: string;
  markdown?: string;
  isActive: boolean;
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
}

interface OrderItem {
  id: string;
  product?: {
    name?: string;
  };
  price: number;
  quantity: number;
  weight: number;
}

interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: string;
  trackingNumber?: string;
  createdAt: string;
  user?: { id?: string; name?: string; email?: string };
  customerName?: string;
  customerEmail?: string;
  shippingAddress?: {
    street?: string;
    address?: string;
    city?: string;
    country?: string;
  };
}

const SellerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [formMessage, setFormMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    weight: "",
    dimensions: "",
    affiliatedLink: "",
    colors: "",
    sizes: [] as string[],
    markdown: "",
  });

  const [files, setFiles] = useState({
    images: [] as File[],
  });

  const [previewUrls, setPreviewUrls] = useState({
    images: [] as string[],
  });

  const [existingImages, setExistingImages] = useState<string[]>([]);

  // 1. Add order management tab UI control
  const [activeTab, setActiveTab] = useState<"dashboard" | "orders">(
    "dashboard"
  );

  // Define available sizes based on category

  const getAvailableSizes = (categoryName: string) => {
    if (
      categoryName.toLowerCase().includes("clothing") ||
      categoryName.toLowerCase().includes("clothes")
    ) {
      return ["XS", "S", "M", "L", "XL", "XXL"];
    } else if (categoryName.toLowerCase().includes("sports")) {
      return ["S", "M", "L"];
    }
    return [];
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsResponse, categoriesResponse, ordersResponse] =
          await Promise.all([
            axios.get(API_ENDPOINTS.SELLER_PRODUCTS),
            axios.get(API_ENDPOINTS.CATEGORIES),
            axios.get(API_ENDPOINTS.SELLER_ORDERS),
          ]);

        setProducts(productsResponse.data);
        setCategories(categoriesResponse.data);
        setOrders(ordersResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const newFiles = selectedFiles.slice(0, 10); // Limit to 10 files
    setFiles((prev) => ({ ...prev, images: newFiles }));
    const urls = newFiles.map((file) => URL.createObjectURL(file));
    // Combine existing images with new preview URLs
    setPreviewUrls((prev) => ({ 
      ...prev, 
      images: [...existingImages, ...urls] 
    }));
  };

  const clearFiles = () => {
    setFiles({ images: [] });
    setPreviewUrls({ images: [] });
    setExistingImages([]);
  };

  const resetForm = () => {
    setProductForm({
      name: "",
      description: "",
      price: "",
      category: "",
      weight: "",
      dimensions: "",
      affiliatedLink: "",
      colors: "",
      sizes: [],
      markdown: "",
    });
    clearFiles();
    setFormMessage(null);
  };

  const handleSizeChange = (size: string, checked: boolean) => {
    if (checked) {
      setProductForm((prev) => ({
        ...prev,
        sizes: [...prev.sizes, size],
      }));
    } else {
      setProductForm((prev) => ({
        ...prev,
        sizes: prev.sizes.filter((s) => s !== size),
      }));
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormMessage(null);

    try {
      const formData = new FormData();

      // Add form fields
      Object.entries(productForm).forEach(([key, value]) => {
        if (key === "sizes") {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value as string);
        }
      });

      // Add existing images (for updates)
      if (editingProduct && existingImages.length > 0) {
        formData.append("existingImages", JSON.stringify(existingImages));
      }

      // Add new files
      files.images.forEach((file) => {
        formData.append("images", file);
      });

      if (editingProduct) {
        const response = await axios.put(
          `${API_ENDPOINTS.PRODUCTS}/${editingProduct.id}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        setProducts(
          products.map((p) => (p.id === editingProduct.id ? response.data : p))
        );
        setEditingProduct(null);
        setFormMessage({
          type: "success",
          text: "Product updated successfully! 🎉",
        });
        setTimeout(() => setFormMessage(null), 5000);
      } else {
        const response = await axios.post(API_ENDPOINTS.PRODUCTS, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        setProducts([...products, response.data]);
        setShowAddProduct(false);
        setFormMessage({
          type: "success",
          text: "Product added successfully! 🎉",
        });
        setTimeout(() => setFormMessage(null), 5000);
      }

      // Reset form
      resetForm();
    } catch (error) {
      console.error("Error saving product:", error);
      setFormMessage({
        type: "error",
        text: "Error saving product. Please try again. ❌",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      weight: product.weight.toString(),
      dimensions: product.dimensions,
      affiliatedLink: product.affiliatedLink || "",
      colors: product.colors ? product.colors.join(", ") : "",
      sizes: product.sizes || [],
      markdown: product.markdown || "",
    });
    // Store existing images separately
    setExistingImages(product.images || []);
    setPreviewUrls({
      images: product.images || [],
    });
    setFiles({ images: [] }); // Clear new files
    setShowAddProduct(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(`${API_ENDPOINTS.PRODUCTS}/${id}`);
        setProducts(products.filter((p) => p.id !== id));
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Error deleting product. Please try again.");
      }
    }
  };

  const toggleProductStatus = async (product: Product) => {
    try {
      const response = await axios.put(
        `${API_ENDPOINTS.PRODUCTS}/${product.id}`,
        {
          ...product,
          isActive: !product.isActive,
        }
      );
      setProducts(
        products.map((p) => (p.id === product.id ? response.data : p))
      );
    } catch (error) {
      console.error("Error updating product status:", error);
    }
  };

  // Calculate real revenue from orders
  const totalRevenue = orders.reduce((sum, order) => {
    // Only count paid orders
    if (order.status === "paid" || order.status === "delivered") {
      // Calculate revenue for this seller's products in the order
      const sellerItems = order.items.filter((item: OrderItem) => {
        // Check if this item belongs to the current seller
        return products.some((product) => product.id === item.id);
      });

      return (
        sum +
        sellerItems.reduce((itemSum: number, item: OrderItem) => {
          return itemSum + item.price * item.quantity;
        }, 0)
      );
    }
    return sum;
  }, 0);

  // Calculate additional stats
  const totalOrders = orders.filter((order) =>
    order.items.some((item: OrderItem) =>
      products.some((product) => product.id === item.id)
    )
  ).length;

  const completedOrders = orders.filter(
    (order) =>
      (order.status === "paid" || order.status === "delivered") &&
      order.items.some((item: OrderItem) =>
        products.some((product) => product.id === item.id)
      )
  ).length;

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
          <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}!</p>
        </div>

        {/* Show tab bar */}
        <div className="mb-8">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-4 py-2 rounded-t-lg font-bold mr-2 ${
              activeTab === "dashboard"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-4 py-2 rounded-t-lg font-bold ${
              activeTab === "orders"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Manage Orders
          </button>
        </div>

        {/* Render tab content */}
        {activeTab === "dashboard" && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Package className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Total Products
                    </h3>
                    <p className="text-2xl font-bold text-blue-600">
                      {products.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="bg-green-100 p-3 rounded-full">
                    <Eye className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Active Products
                    </h3>
                    <p className="text-2xl font-bold text-green-600">
                      {products.filter((p) => p.isActive).length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="bg-orange-100 p-3 rounded-full">
                    <ShoppingBag className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Total Orders
                    </h3>
                    <p className="text-2xl font-bold text-orange-600">
                      {totalOrders}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="bg-purple-100 p-3 rounded-full">
                    <DollarSign className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Revenue
                    </h3>
                    <p className="text-2xl font-bold text-purple-600">
                      £{totalRevenue.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {completedOrders} completed orders
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Add Product Button */}
            <div className="mb-6">
              <button
                onClick={() => {
                  setShowAddProduct(true);
                  setEditingProduct(null);
                  resetForm();
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition-colors"
              >
                <Plus className="h-5 w-5" />
                <span>Add New Product</span>
              </button>
            </div>

            {/* Add/Edit Product Form */}
            {showAddProduct && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-8 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
                  <h2 className="text-2xl font-bold text-white">
                    {editingProduct ? "✏️ Edit Product" : "➕ Add New Product"}
                  </h2>
                  <p className="text-blue-100 mt-1">
                    {editingProduct
                      ? "Update your product information"
                      : "Fill in the details to add a new product"}
                  </p>
                </div>

                <form onSubmit={handleFormSubmit} className="p-8 space-y-6">
                  {/* Form Message */}
                  {formMessage && (
                    <div
                      className={`p-4 rounded-lg border-2 ${
                        formMessage.type === "success"
                          ? "bg-green-50 border-green-200 text-green-800"
                          : "bg-red-50 border-red-200 text-red-800"
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="text-lg mr-2">
                          {formMessage.type === "success" ? "✅" : "❌"}
                        </span>
                        <span className="font-medium">{formMessage.text}</span>
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        🏷️ Product Name
                      </label>
                      <input
                        type="text"
                        value={productForm.name}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            name: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400"
                        placeholder="Enter product name"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        💰 Price (£)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={productForm.price}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            price: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400"
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      📝 Description
                    </label>
                    <textarea
                      value={productForm.description}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          description: e.target.value,
                        })
                      }
                      rows={4}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400 resize-none"
                      placeholder="Describe your product in detail..."
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      📄 Markdown Content (Optional)
                    </label>
                    <MarkdownEditor
                      value={productForm.markdown}
                      onChange={(value) =>
                        setProductForm({
                          ...productForm,
                          markdown: value,
                        })
                      }
                      placeholder="Add detailed markdown content about your product..."
                    />
                    <p className="text-xs text-gray-500">
                      💡 Use markdown to create rich, formatted content with headings, lists, links, and more.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        📂 Category
                      </label>
                      <select
                        value={productForm.category}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            category: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                        required
                      >
                        <option value="">Choose a category</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        ⚖️ Weight (kg)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={productForm.weight}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            weight: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400"
                        placeholder="0.0"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        📏 Dimensions
                      </label>
                      <input
                        type="text"
                        value={productForm.dimensions}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            dimensions: e.target.value,
                          })
                        }
                        placeholder="e.g., 20x15x10 cm"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400"
                        required
                      />
                    </div>
                  </div>

                  {/* Colors Input */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      🎨 Colors
                    </label>
                    <input
                      type="text"
                      value={productForm.colors}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          colors: e.target.value,
                        })
                      }
                      placeholder="e.g., Red, Blue, Green (comma-separated)"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400"
                    />
                    <p className="text-xs text-gray-500">
                      💡 Separate multiple colors with commas
                    </p>
                  </div>

                  {/* Sizes Selection - Show for Clothing and Sports categories */}
                  {productForm.category &&
                    (() => {
                      const categoryName =
                        categories.find((c) => c.id === productForm.category)
                          ?.name || "";
                      const availableSizes = getAvailableSizes(categoryName);
                      return availableSizes.length > 0;
                    })() && (
                      <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          📏 Available Sizes
                        </label>
                        <div className="flex flex-wrap gap-3">
                          {getAvailableSizes(
                            categories.find(
                              (c) => c.id === productForm.category
                            )?.name || ""
                          ).map((size) => (
                            <label
                              key={size}
                              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                                productForm.sizes.includes(size)
                                  ? "border-blue-500 bg-blue-50 text-blue-700"
                                  : "border-gray-200 hover:border-gray-300 text-gray-700"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={productForm.sizes.includes(size)}
                                onChange={(e) =>
                                  handleSizeChange(size, e.target.checked)
                                }
                                className="sr-only"
                              />
                              <span className="text-sm font-medium">
                                {size}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      📸 Product Images (up to 10)
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
                        className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 cursor-pointer"
                        required={!editingProduct}
                      />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="text-gray-500 text-sm">
                          Click to select images or drag & drop
                        </span>
                      </div>
                    </div>
                    {previewUrls.images.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700 mb-3">
                          Preview ({previewUrls.images.length} images):
                          {editingProduct && existingImages.length > 0 && (
                            <span className="text-xs text-gray-500 ml-2">
                              ({existingImages.length} existing, {files.images.length} new)
                            </span>
                          )}
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                          {previewUrls.images.map((url, index) => {
                            const isExisting = index < existingImages.length;
                            return (
                              <div key={index} className="relative group">
                                <img
                                  src={url}
                                  alt={`Product ${index + 1}`}
                                  className="w-full h-24 object-cover rounded-lg border-2 border-gray-200 group-hover:border-blue-500 transition-all duration-200"
                                />
                                <div className="absolute top-1 right-1 bg-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <span className="text-xs text-gray-600 font-medium">
                                    {index + 1}
                                  </span>
                                </div>
                                {isExisting && (
                                  <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded">
                                    Existing
                                  </div>
                                )}
                                {editingProduct && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (isExisting) {
                                        // Remove from existing images
                                        const newExisting = existingImages.filter((_, i) => i !== index);
                                        setExistingImages(newExisting);
                                        // Keep new file previews
                                        const newFileUrls = files.images.map((file) => URL.createObjectURL(file));
                                        setPreviewUrls({
                                          images: [...newExisting, ...newFileUrls],
                                        });
                                      } else {
                                        // Remove from new files
                                        const fileIndex = index - existingImages.length;
                                        const newFiles = files.images.filter((_, i) => i !== fileIndex);
                                        setFiles({ images: newFiles });
                                        // Revoke old blob URLs and create new ones
                                        previewUrls.images.slice(existingImages.length).forEach((url, i) => {
                                          if (i !== fileIndex && url.startsWith('blob:')) {
                                            URL.revokeObjectURL(url);
                                          }
                                        });
                                        const newUrls = newFiles.map((file) => URL.createObjectURL(file));
                                        setPreviewUrls({
                                          images: [...existingImages, ...newUrls],
                                        });
                                      }
                                    }}
                                    className="absolute bottom-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                    title="Remove image"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      🔗 Affiliated Link (Optional)
                    </label>
                    <input
                      type="url"
                      value={productForm.affiliatedLink}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          affiliatedLink: e.target.value,
                        })
                      }
                      placeholder="https://example.com/affiliate-link"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400"
                    />
                    <p className="text-xs text-gray-500">
                      💡 Add an affiliate link to earn commissions
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                    <button
                      type="submit"
                      disabled={formLoading}
                      className={`flex items-center justify-center px-8 py-3 rounded-lg font-semibold text-white transition-all duration-200 ${
                        formLoading
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 shadow-lg hover:shadow-xl"
                      }`}
                    >
                      {formLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          {editingProduct ? "Updating..." : "Adding..."}
                        </>
                      ) : (
                        <>
                          {editingProduct
                            ? "✏️ Update Product"
                            : "➕ Add Product"}
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddProduct(false);
                        setEditingProduct(null);
                        resetForm();
                      }}
                      disabled={formLoading}
                      className="flex items-center justify-center px-8 py-3 rounded-lg font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 border-2 border-gray-200 hover:border-gray-300 transition-all duration-200"
                    >
                      ❌ Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Products List */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Your Products
                </h2>
              </div>

              {products.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-gray-600">
                    No products yet. Add your first product to get started!
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {products.map((product) => (
                    <div key={product.id} className="p-6">
                      <div className="flex items-center space-x-4">
                        <img
                          src={product.images[0] || "/placeholder-image.png"}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded-md"
                        />

                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {product.name}
                          </h3>
                          <p className="text-gray-600 text-sm line-clamp-1">
                            {product.description}
                          </p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-lg font-bold text-blue-600">
                              £{product.price}
                            </span>
                            <span className="text-sm text-gray-500">
                              {product.weight}kg
                            </span>
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                product.isActive
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {product.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>

                          {/* Display Colors and Sizes */}
                          {(product.colors && product.colors.length > 0) ||
                          (product.sizes && product.sizes.length > 0) ? (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {product.colors && product.colors.length > 0 && (
                                <div className="flex items-center space-x-1">
                                  <span className="text-xs text-gray-500">
                                    Colors:
                                  </span>
                                  <span className="text-xs text-gray-700">
                                    {Array.isArray(product.colors)
                                      ? product.colors.join(", ")
                                      : product.colors}
                                  </span>
                                </div>
                              )}
                              {product.sizes && product.sizes.length > 0 && (
                                <div className="flex items-center space-x-1">
                                  <span className="text-xs text-gray-500">
                                    Sizes:
                                  </span>
                                  <div className="flex space-x-1">
                                    {product.sizes.map((size, index) => (
                                      <span
                                        key={index}
                                        className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full"
                                      >
                                        {size}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : null}
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => toggleProductStatus(product)}
                            className={`p-2 rounded-md ${
                              product.isActive
                                ? "text-gray-600 hover:bg-gray-100"
                                : "text-green-600 hover:bg-green-100"
                            }`}
                            title={
                              product.isActive ? "Hide product" : "Show product"
                            }
                          >
                            {product.isActive ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>

                          <button
                            onClick={() => handleEdit(product)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-md"
                            title="Edit product"
                          >
                            <Edit className="h-5 w-5" />
                          </button>

                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-md"
                            title="Delete product"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
        {activeTab === "orders" && (
          <SellerOrdersManager orders={orders} setOrders={setOrders} />
        )}
      </div>
    </div>
  );
};

export default SellerDashboard;
