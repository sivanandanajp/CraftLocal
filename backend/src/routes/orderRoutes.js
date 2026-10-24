
const express = require('express');
const router = express.Router();

const {
  createOrder,
  getMyOrders,
  getSellerOrders,
  updateSellerOrderItemStatus,
} = require('../controllers/orderController');

const {
  simulatePayment,
} = require('../controllers/paymentController');

const { protect } = require('../middleware/authMiddleware');

// Simulated card or UPI payment.
router.post('/simulate-payment', protect, simulatePayment);

// Seller order management.
router.get('/seller-orders', protect, getSellerOrders);

router.patch(
  '/seller-orders/:orderId/items/:productId/status',
  protect,
  updateSellerOrderItemStatus
);

// Buyer checkout and order history.
router.post('/', protect, createOrder);
router.get('/my-orders', protect, getMyOrders);

module.exports = router;
