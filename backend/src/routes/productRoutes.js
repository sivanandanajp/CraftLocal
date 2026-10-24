
const express = require('express');
const router = express.Router();

const {
  getProducts,
  getProductById,
  getProductLocations,
  getMyProducts,
  createProduct,
  updateMyProduct,
  deleteMyProduct,
} = require('../controllers/productController');

const { protect } = require('../middleware/authMiddleware');

// Fixed routes must come before /:id.
router.get('/locations', getProductLocations);

// Seller and creator product management.
router.get('/my-products', protect, getMyProducts);
router.post('/', protect, createProduct);
router.put('/my-products/:id', protect, updateMyProduct);
router.delete('/my-products/:id', protect, deleteMyProduct);

// Public product browsing.
router.get('/', getProducts);
router.get('/:id', getProductById);

module.exports = router;
