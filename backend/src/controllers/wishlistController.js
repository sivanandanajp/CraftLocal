const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const mongoose = require('mongoose');

exports.getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.user._id }).populate('products');
    if (!wishlist) {
      return res.json({ userId: req.user._id, products: [] });
    }
    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ message: 'productId is required' });
    }
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'productId is invalid' });
    }
    if (!await Product.exists({ _id: productId })) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let wishlist = await Wishlist.findOne({ userId: req.user._id });
    if (!wishlist) {
      wishlist = new Wishlist({ userId: req.user._id, products: [] });
    }

    const productIndex = wishlist.products.findIndex((id) => id.toString() === productId);
    if (productIndex >= 0) {
      wishlist.products.splice(productIndex, 1);
    } else {
      wishlist.products.push(productId);
    }

    await wishlist.save();
    await wishlist.populate('products');
    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};