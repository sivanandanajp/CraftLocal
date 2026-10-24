const express = require('express');
const router = express.Router();

const {
  getProductReviews,
  getReviewEligibility,
  createReview,
  updateReview,
  deleteReview,
} = require('../controllers/reviewController');

const { protect } = require('../middleware/authMiddleware');

// Keep the eligibility route before the general product reviews route.
router.get('/:productId/eligibility', protect, getReviewEligibility);
router.get('/:productId', getProductReviews);
router.post('/:productId', protect, createReview);
router.patch('/:reviewId', protect, updateReview);
router.delete('/:reviewId', protect, deleteReview);

module.exports = router;
