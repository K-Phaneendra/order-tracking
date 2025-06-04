import Order from '../models/Order.js';

export const createOrder = async (req, res) => {
  try {
    const newOrder = await Order.create(req.body);
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllOrders = async (req, res) => {
  const orders = await Order.findAll();
  res.json(orders);
};

export const getOrdersByPartner = async (req, res) => {
  const { id } = req.params;
  const orders = await Order.findByDeliveryPartner(id);
  res.json(orders);
};
