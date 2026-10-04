const Order = require('../models/Order');

// @desc Create new order
// @route POST /api/orders
exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, totalAmount } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No order items provided' });
    }

    const order = new Order({
      userId: req.user._id,
      items,
      shippingAddress,
      totalAmount,
      status: 'Pending'
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
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