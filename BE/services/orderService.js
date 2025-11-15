import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import crypto from "crypto";

// Generate unique tracking number
const generateTrackingNumber = async () => {
  let trackingNumber;
  let isUnique = false;

  while (!isUnique) {
    // Generate a tracking number: ZM + 9 random digits
    trackingNumber = "ZM" + crypto.randomInt(100000000, 999999999).toString();

    // Check if it already exists
    const existingOrder = await Order.findOne({ trackingNumber });
    if (!existingOrder) {
      isUnique = true;
    }
  }

  return trackingNumber;
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

    // Generate unique tracking number for guest orders
    const trackingNumber = await generateTrackingNumber();

    const order = new Order({
      ...orderData,
      user: user._id,
      trackingNumber,
      status: "paid", // Guest orders start as paid since payment is already processed
    });

    await order.save();
    const populatedOrder = await order.populate(
      "items.product",
      "name price imageUrl"
    );

    // Return order with tracking number
    return {
      ...populatedOrder.toObject(),
      trackingNumber,
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
      // Check if order already has a tracking number
      const existingOrder = await Order.findById(orderId);
      if (!existingOrder.trackingNumber) {
        // Only set tracking number if it doesn't already exist
        if (trackingNumber) {
          // Check if tracking number is unique
          const orderWithSameTracking = await Order.findOne({
            trackingNumber,
            _id: { $ne: orderId },
          });
          if (!orderWithSameTracking) {
            updateData.trackingNumber = trackingNumber;
          } else {
            // Generate a new unique tracking number
            updateData.trackingNumber = await generateTrackingNumber();
          }
        } else {
          // Generate tracking number if not provided
          updateData.trackingNumber = await generateTrackingNumber();
        }
      }
      if (deliveryPartner) updateData.deliveryPartner = deliveryPartner;
    }
    // Don't remove tracking number if status changes - keep it for reference

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

export const getOrderByTrackingNumber = async (trackingNumber) => {
  try {
    const order = await Order.findOne({ trackingNumber })
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
