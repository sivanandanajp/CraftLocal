const Cart = require('../models/Cart');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// @desc Get current user's cart
// @route GET /api/cart
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id }).populate('items.productId');
    if (!cart) {
      return res.json({ userId: req.user._id, items: [] });
    }
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Add or update item in cart
// @route POST /api/cart
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const requestedQuantity = quantity === undefined ? 1 : Number(quantity);
    if (!mongoose.Types.ObjectId.isValid(productId) || !Number.isInteger(requestedQuantity) || requestedQuantity < 1) {
      return res.status(400).json({ message: 'A valid productId and positive integer quantity are required' });
    }
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
      cart = new Cart({ userId: req.user._id, items: [] });
    }

    const itemIndex = cart.items.findIndex((item) => item.productId.toString() === productId);

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += requestedQuantity;
    } else {
      cart.items.push({ productId, quantity: requestedQuantity });
    }

    await cart.save();
    await cart.populate('items.productId');
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};