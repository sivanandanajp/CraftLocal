const express = require('express');
const router = express.Router();

// Temporary route to prevent app.use crash
router.get('/', (req, res) => res.json({ message: 'Order endpoint working' }));
const { createOrder, getMyOrders } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createOrder);
router.get('/myorders', protect, getMyOrders);

module.exports = router;