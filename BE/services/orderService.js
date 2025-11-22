import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import crypto from "crypto";

// Generate unique internal tracking number
const generateInternalTrackingNumber = async () => {
  let internalTrackingNumber;
  let isUnique = false;

  while (!isUnique) {
    // Generate an internal tracking number: ZM + 9 random digits
    internalTrackingNumber =
      "ZM" + crypto.randomInt(100000000, 999999999).toString();

    // Check if it already exists
    const existingOrder = await Order.findOne({ internalTrackingNumber });
    if (!existingOrder) {
      isUnique = true;
    }
  }

  return internalTrackingNumber;
};

export const createOrder = async (orderData, userId) => {
  try {
    const order = new Order({
      ...orderData,
      user: userId,
    });

    await order.save();
    return await order.populate("items.product", "name price imageUrl");
  } catch (error) {
    throw error;
  }
};

export const createGuestOrder = async (orderData, guestInfo) => {
  try {
    // Check if user with this email already exists
    let user = await User.findOne({ email: guestInfo.email.toLowerCase() });

    if (!user) {
      // Create a new guest user without password
      user = new User({
        name: guestInfo.fullName,
        email: guestInfo.email.toLowerCase(),
        phone: guestInfo.phone,
        password: undefined, // No password for guest users
        role: "customer",
        isApproved: true,
      });
      await user.save();
    } else {
      // Update existing user's info if needed
      if (!user.name || user.name === "") {
        user.name = guestInfo.fullName;
      }
      if (!user.phone || user.phone === "") {
        user.phone = guestInfo.phone;
      }
      await user.save();
    }

    // remove null values from orderData
    Object.keys(orderData).forEach((key) => {
      if (orderData[key] === null) {
        delete orderData[key];
      }
    });

    // Generate unique internal tracking number for guest orders
    const internalTrackingNumber = await generateInternalTrackingNumber();

    const order = new Order({
      ...orderData,
      user: user._id,
      internalTrackingNumber,
      status: "paid", // Guest orders start as paid since payment is already processed
    });

    await order.save();
    const populatedOrder = await order.populate(
      "items.product",
      "name price imageUrl"
    );

    // Return order with internal tracking number
    return {
      ...populatedOrder.toObject(),
      internalTrackingNumber,
    };
  } catch (error) {
    throw error;
  }
};

export const getUserOrders = async (userId, userRole) => {
  try {
    let query = {};

    // Admin can see all orders, others only their own
    if (userRole !== "admin") {
      query.user = userId;
    }

    const orders = await Order.find(query)
      .populate("user", "name email")
      .populate("items.product", "name price imageUrl seller")
      .sort({ createdAt: -1 });

    return orders;
  } catch (error) {
    throw error;
  }
};

export const getOrderById = async (orderId, userId, userRole) => {
  try {
    let query = { _id: orderId };

    // Admin can see any order, others only their own
    if (userRole !== "admin") {
      query.user = userId;
    }

    const order = await Order.findOne(query)
      .populate("user", "name email")
      .populate("items.product", "name price imageUrl seller");

    if (!order) {
      throw new Error("Order not found");
    }

    return order;
  } catch (error) {
    throw error;
  }
};

export const getSellerOrders = async (sellerId) => {
  try {
    // Find orders that contain products from this seller
    const orders = await Order.find({
      "items.product": {
        $in: await Product.find({ seller: sellerId }).distinct("_id"),
      },
    })
      .populate("user", "name email")
      .populate("items.product", "name price imageUrl seller")
      .sort({ createdAt: -1 });

    return orders;
  } catch (error) {
    throw error;
  }
};

export const updateOrderStatus = async (
  orderId,
  status,
  userId,
  userRole,
  trackingNumber,
  deliveryPartner
) => {
  try {
    let query = { _id: orderId };

    // Only admin or the order owner can update status; extend for seller on their items
    if (userRole === "seller") {
      const productsOfSeller = await Product.find({ seller: userId }).distinct(
        "_id"
      );
      query["items.product"] = { $in: productsOfSeller };
    } else if (userRole !== "admin") {
      query.user = userId;
    }

    // Prepare update data
    const updateData = { status, updatedAt: new Date() };
    if (status === "handed to delivery partner") {
      // Check if order already has an internal tracking number
      const existingOrder = await Order.findById(orderId);

      // Generate internal tracking number if not already exists
      if (!existingOrder.internalTrackingNumber) {
        updateData.internalTrackingNumber =
          await generateInternalTrackingNumber();
      }

      // trackingNumber is for seller-provided external courier tracking (not unique)
      if (trackingNumber) {
        updateData.trackingNumber = trackingNumber;
      }

      if (deliveryPartner) updateData.deliveryPartner = deliveryPartner;
    }
    // Don't remove tracking numbers if status changes - keep them for reference

    const order = await Order.findOneAndUpdate(query, updateData, {
      new: true,
      runValidators: true,
    }).populate("user", "name email");

    if (!order) {
      throw new Error("Order not found or access denied");
    }

    return order;
  } catch (error) {
    throw error;
  }
};

export const getOrderByTrackingNumber = async (internalTrackingNumber) => {
  try {
    // Search by internalTrackingNumber (auto-generated tracking number)
    const order = await Order.findOne({ internalTrackingNumber })
      .populate("user", "name email phone")
      .populate("items.product", "name price imageUrl");

    if (!order) {
      throw new Error("Order not found");
    }

    return order;
  } catch (error) {
    throw error;
  }
};
