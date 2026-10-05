const express = require('express');
const router = express.Router();

// Temporary route to prevent app.use crash
router.get('/', (req, res) => res.json({ message: 'Cart endpoint working' }));

module.exports = router;
const { getCart, addToCart } = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getCart);
router.post('/add', protect, addToCart);

module.exports = router; // <-- MUST BE HERE
