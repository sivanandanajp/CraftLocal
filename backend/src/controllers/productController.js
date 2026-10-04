const Product = require('../models/Product');

// @desc Get all products (with optional search filter)
// @route GET /api/products
exports.getProducts = async (req, res) => {
  try {
    const keyword = req.query.keyword ? {
      title: { $regex: req.query.keyword, $options: 'i' }
    } : {};

    const products = await Product.find({ ...keyword });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get single product by ID
// @route GET /api/products/:id
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Create new product (For Creators)
// @route POST /api/products
exports.createProduct = async (req, res) => {
  try {
    const { title, description, price, category, stock, images } = req.body;
    const product = await Product.create({
      title,
      description,
      price,
      category,
      stock,
      images,
      creatorId: req.user ? req.user._id : null
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};