import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

export const createOrder = async (orderData, userId) => {
  try {
    const order = new Order({
      ...orderData,
      user: userId
    });
    
    await order.save();
    return await order.populate('items.product', 'name price imageUrl');
  } catch (error) {
    throw error;
  }
};

export const getUserOrders = async (userId, userRole) => {
  try {
    let query = {};
    
    // Admin can see all orders, others only their own
    if (userRole !== 'admin') {
      query.user = userId;
    }
    
    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate('items.product', 'name price imageUrl seller')
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
    if (userRole !== 'admin') {
      query.user = userId;
    }
    
    const order = await Order.findOne(query)
      .populate('user', 'name email')
      .populate('items.product', 'name price imageUrl seller');
    
    if (!order) {
      throw new Error('Order not found');
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
      'items.product': {
        $in: await Product.find({ seller: sellerId }).distinct('_id')
      }
    })
    .populate('user', 'name email')
    .populate('items.product', 'name price imageUrl seller')
    .sort({ createdAt: -1 });
    
    return orders;
  } catch (error) {
    throw error;
  }
};

export const updateOrderStatus = async (orderId, status, userId, userRole) => {
  try {
    let query = { _id: orderId };
    
    // Only admin or the order owner can update status
    if (userRole !== 'admin') {
      query.user = userId;
    }
    
    const order = await Order.findOneAndUpdate(
      query,
      { status, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('user', 'name email');
    
    if (!order) {
      throw new Error('Order not found or access denied');
    }
    
    return order;
  } catch (error) {
    throw error;
  }
};
