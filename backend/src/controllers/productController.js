const Product = require('../models/Product');

// Fetch all products (supports search keyword filter)
exports.getProducts = async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = {};

    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.title = { $regex: escapedSearch, $options: 'i' };
    }
    if (category) {
      query.category = category;
    }

    const products = await Product.find(query);
    res.json(products);
  } catch (error) {
    res.status(error.name === 'CastError' ? 400 : 500).json({ message: error.message });
  }
};

// Get single product details
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
     res.json(product);
  } catch (error) {
     res.status(error.name === 'CastError' ? 400 : 500).json({ message: error.message });
  }
};

// Create a new product (Creator publishing)
exports.createProduct = async (req, res) => {
  try {
    if (req.user.role !== 'creator') {
      return res.status(403).json({ message: 'Only creators can publish products' });
    }

    const { title, description, price, category, stock, image } = req.body;
    if (!title || !description || price === undefined || !category || !image) {
      return res.status(400).json({ message: 'title, description, price, category, and image are required' });
    }
    if (!Number.isFinite(Number(price)) || Number(price) < 0 || (stock !== undefined && (!Number.isInteger(Number(stock)) || Number(stock) < 0))) {
      return res.status(400).json({ message: 'price and stock must be valid non-negative numbers' });
    }
    const product = await Product.create({
      title,
      description,
      price,
      category,
      stock,
      image,
      creatorId: req.user._id
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(error.name === 'ValidationError' ? 400 : 500).json({ message: error.message });
  }
};