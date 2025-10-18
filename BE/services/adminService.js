import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Category from "../models/Category.js";

export const getAdminStats = async () => {
  try {
    const totalCustomers = await User.countDocuments({ role: "customer" });
    const totalSellers = await User.countDocuments({ role: "seller" });
    const pendingSellers = await User.countDocuments({
      role: "seller",
      isApproved: false,
    });
    const bannedUsers = await User.countDocuments({ isBanned: true });
    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ isActive: true });
    const totalOrders = await Order.countDocuments();

    // Calculate total revenue
    const revenueResult = await Order.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: "$total" } } },
    ]);
    const totalRevenue =
      revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    return {
      totalCustomers,
      totalSellers,
      pendingSellers,
      bannedUsers,
      totalProducts,
      activeProducts,
      totalOrders,
      totalRevenue,
    };
  } catch (error) {
    throw error;
  }
};

export const getAllUsers = async () => {
  try {
    const users = await User.find({}).select("-password");
    // Transform to ensure id field is present
    return users.map((user) => ({
      ...user.toObject(),
      id: user._id.toString(),
    }));
  } catch (error) {
    throw error;
  }
};

export const approveUser = async (userId) => {
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { isApproved: true, updatedAt: new Date() },
      { new: true }
    ).select("-password");

    if (!user) {
      throw new Error("User not found");
    }

    return {
      ...user.toObject(),
      id: user._id.toString(),
    };
  } catch (error) {
    throw error;
  }
};

export const banUser = async (userId, isBanned) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    // Prevent admin from banning themselves
    if (user.role === "admin") {
      throw new Error("Cannot ban admin users");
    }

    user.isBanned = isBanned;
    user.updatedAt = new Date();
    await user.save();

    return {
      ...user.toObject(),
      id: user._id.toString(),
    };
  } catch (error) {
    throw error;
  }
};

export const deleteUser = async (userId) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    // Prevent admin from deleting themselves
    if (user.role === "admin") {
      throw new Error("Cannot delete admin users");
    }

    // Delete associated products if user is a seller
    if (user.role === "seller") {
      await Product.deleteMany({ seller: userId });
    }

    await User.findByIdAndDelete(userId);

    return { message: "User deleted successfully" };
  } catch (error) {
    throw error;
  }
};

export const getAllProducts = async () => {
  try {
    const products = await Product.find({})
      .populate("category", "name description")
      .populate("seller", "name email")
      .sort({ createdAt: -1 });

    return products.map((product) => ({
      ...product.toObject(),
      id: product._id.toString(),
      sellerId: product.seller._id.toString(),
      sellerName: product.seller.name,
      sellerEmail: product.seller.email,
    }));
  } catch (error) {
    throw error;
  }
};

export const getAllOrders = async () => {
  try {
    const orders = await Order.find({})
      .populate("user", "name email role")
      .populate("items.product", "name price imageUrl seller")
      .sort({ createdAt: -1 });

    return orders.map((order) => ({
      ...order.toObject(),
      id: order._id.toString(),
      userId: order.user?._id?.toString() || "",
      customerName: order.user?.name || "Unknown User",
      customerEmail: order.user?.email || "Unknown Email",
      customerRole: order.user?.role || "Unknown Role",
      items: order.items.map((item) => ({
        ...item.toObject(),
        id: item.product?._id?.toString() || "",
        productId: item.product?._id?.toString() || "",
        name: item.product?.name || "Unknown Product",
        price: item.price,
        imageUrl: item.product?.imageUrl || "",
        weight: item.product?.weight || 0,
        quantity: item.quantity,
      })),
    }));
  } catch (error) {
    throw error;
  }
};

export const getAllCategories = async () => {
  try {
    const categories = await Category.find({}).sort({ createdAt: -1 });
    return categories.map((category) => ({
      ...category.toObject(),
      id: category._id.toString(),
    }));
  } catch (error) {
    throw error;
  }
};

export const createCategory = async (categoryData) => {
  try {
    const { name, description } = categoryData;

    if (!name || !description) {
      throw new Error("Name and description are required");
    }

    // Check if category name already exists
    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });

    if (existingCategory) {
      throw new Error("Category with this name already exists");
    }

    const category = new Category({
      name: name.trim(),
      description: description.trim(),
    });

    await category.save();
    return {
      ...category.toObject(),
      id: category._id.toString(),
    };
  } catch (error) {
    throw error;
  }
};

export const updateCategory = async (categoryId, updateData) => {
  try {
    const { name, description } = updateData;

    if (!name || !description) {
      throw new Error("Name and description are required");
    }

    // Check if new name conflicts with existing categories
    const existingCategory = await Category.findOne({
      _id: { $ne: categoryId },
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });

    if (existingCategory) {
      throw new Error("Category with this name already exists");
    }

    const category = await Category.findByIdAndUpdate(
      categoryId,
      {
        name: name.trim(),
        description: description.trim(),
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    );

    if (!category) {
      throw new Error("Category not found");
    }

    return {
      ...category.toObject(),
      id: category._id.toString(),
    };
  } catch (error) {
    throw error;
  }
};

export const getOrderById = async (orderId) => {
  try {
    const order = await Order.findById(orderId)
      .populate("user", "name email role")
      .populate(
        "items.product",
        "name price imageUrl seller description category isActive"
      );

    if (!order) {
      throw new Error("Order not found");
    }

    return {
      ...order.toObject(),
      id: order._id.toString(),
      userId: order.user?._id?.toString() || "",
      customer: order.user
        ? {
            id: order.user._id.toString(),
            name: order.user.name,
            email: order.user.email,
            role: order.user.role,
          }
        : null,
      items: order.items.map((item) => ({
        ...item.toObject(),
        id: item.product?._id?.toString() || "",
        productId: item.product?._id?.toString() || "",
        name: item.product?.name || "Unknown Product",
        price: item.price,
        imageUrl: item.product?.imageUrl || "",
        weight: item.product?.weight || 0,
        quantity: item.quantity,
        productDetails: item.product
          ? {
              id: item.product._id.toString(),
              name: item.product.name,
              description: item.product.description || "",
              category: item.product.category || "",
              sellerId: item.product.seller?._id?.toString() || "",
              isActive: item.product.isActive || false,
            }
          : null,
      })),
    };
  } catch (error) {
    throw error;
  }
};

export const deleteCategory = async (categoryId) => {
  try {
    // Check if category is being used by any products
    const productsUsingCategory = await Product.countDocuments({
      category: categoryId,
    });

    if (productsUsingCategory > 0) {
      throw new Error(
        `Cannot delete category. It is being used by ${productsUsingCategory} product(s).`
      );
    }

    const category = await Category.findByIdAndDelete(categoryId);

    if (!category) {
      throw new Error("Category not found");
    }

    return { message: "Category deleted successfully" };
  } catch (error) {
    throw error;
  }
};
