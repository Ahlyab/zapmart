import * as orderService from '../services/orderService.js';

export const createOrder = async (req, res) => {
  try {
    const order = await orderService.createOrder(req.body, req.user._id);
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const orders = await orderService.getUserOrders(req.user._id, req.user.role);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await orderService.getOrderById(
      req.params.id,
      req.user._id,
      req.user.role
    );
    res.json(order);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getSellerOrders = async (req, res) => {
  try {
    const orders = await orderService.getSellerOrders(req.user._id);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await orderService.updateOrderStatus(
      req.params.id,
      status,
      req.user._id,
      req.user.role
    );
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
