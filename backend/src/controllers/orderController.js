const Order = require('../models/Order');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// @desc Create new order
// @route POST /api/orders
exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'No order items provided' });
    }
    if (!(shippingAddress?.addressLine || shippingAddress?.street) || !shippingAddress?.city || !(shippingAddress?.postalCode || shippingAddress?.zipCode)) {
      return res.status(400).json({ message: 'A complete shippingAddress is required' });
    }

    for (const item of items) {
      if (!mongoose.Types.ObjectId.isValid(item.productId) || !Number.isInteger(Number(item.quantity)) || Number(item.quantity) < 1) {
        return res.status(400).json({ message: 'Each item needs a valid productId and positive integer quantity' });
      }
    }

    const products = await Product.find({ _id: { $in: items.map((item) => item.productId) } });
    const productById = new Map(products.map((product) => [product._id.toString(), product]));
    if (products.length !== new Set(items.map((item) => item.productId.toString())).size) {
      return res.status(404).json({ message: 'One or more products were not found' });
    }

    const orderItems = items.map((item) => ({
      productId: item.productId,
      quantity: Number(item.quantity),
      price: productById.get(item.productId.toString()).price
    }));
    const totalAmount = orderItems.reduce((total, item) => total + item.price * item.quantity, 0);

    const order = new Order({
      userId: req.user._id,
      items: orderItems,
      shippingAddress,
      totalAmount,
      status: 'Pending'
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(error.name === 'ValidationError' ? 400 : 500).json({ message: error.message });
  }
};

// @desc Get logged-in user orders
// @route GET /api/orders/my-orders
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};