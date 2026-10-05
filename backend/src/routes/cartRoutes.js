const express = require('express');
const router = express.Router();
const { getCart, addToCart } = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getCart);
router.post('/add', protect, addToCart);

module.exports = router; // <-- MUST BE HERE