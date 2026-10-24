const mongoose = require('mongoose');
const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

async function canReviewProduct(userId, productId) {
  const product = await Product.findById(productId).select('sellerId').lean();

  if (!product) {
    return { allowed: false, reason: 'Product not found.', product: null };
  }

  // Sellers cannot review their own products.
  if (
    product.sellerId &&
    String(product.sellerId) === String(userId)
  ) {
    return {
      allowed: false,
      reason: 'You cannot review your own product.',
      product,
    };
  }

  // Require this buyer to have an item for this product marked Delivered.
  const deliveredOrder = await Order.findOne({
    userId,
    items: {
      $elemMatch: {
        productId: new mongoose.Types.ObjectId(productId),
        status: 'Delivered',
      },
    },
  })
    .select('_id')
    .lean();

  if (!deliveredOrder) {
    return {
      allowed: false,
      reason: 'You can review this product after your order item is marked Delivered.',
      product,
    };
  }

  return { allowed: true, reason: '', product };
}

// @route GET /api/reviews/:productId
// @access Public
exports.getProductReviews = async (req, res) => {
  const { productId } = req.params;

  if (!isValidId(productId)) {
    return res.status(400).json({ message: 'Invalid product ID.' });
  }

  try {
    const product = await Product.findById(productId).select('_id').lean();
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    const reviews = await Review.find({ productId })
      .populate('userId', 'name fullName')
      .sort({ createdAt: -1 })
      .lean();

    const normalizedReviews = reviews.map((review) => {
      const reviewer = review.userId || {};
      return {
        _id: review._id,
        productId: review.productId,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
        reviewerName:
          reviewer.name || reviewer.fullName || 'CraftLocal buyer',
      };
    });

    const averageRating = reviews.length
      ? Number(
          (
            reviews.reduce((sum, review) => sum + review.rating, 0) /
            reviews.length
          ).toFixed(1)
        )
      : 0;

    return res.status(200).json({
      reviews: normalizedReviews,
      averageRating,
      reviewCount: reviews.length,
    });
  } catch (error) {
    console.error('Get product reviews error:', error);
    return res.status(500).json({ message: 'Unable to load reviews.' });
  }
};

// @route GET /api/reviews/:productId/eligibility
// @access Private
exports.getReviewEligibility = async (req, res) => {
  const { productId } = req.params;

  if (!isValidId(productId)) {
    return res.status(400).json({ message: 'Invalid product ID.' });
  }

  try {
    const eligibility = await canReviewProduct(req.user._id, productId);
    if (!eligibility.product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    const existingReview = await Review.findOne({
      productId,
      userId: req.user._id,
    }).lean();

    return res.status(200).json({
      eligible: eligibility.allowed,
      reason: eligibility.reason,
      review: existingReview
        ? {
            _id: existingReview._id,
            rating: existingReview.rating,
            comment: existingReview.comment,
            createdAt: existingReview.createdAt,
            updatedAt: existingReview.updatedAt,
          }
        : null,
    });
  } catch (error) {
    console.error('Review eligibility error:', error);
    return res.status(500).json({ message: 'Unable to check review eligibility.' });
  }
};

// @route POST /api/reviews/:productId
// @access Private
exports.createReview = async (req, res) => {
  const { productId } = req.params;
  const rating = Number(req.body.rating);
  const comment =
    typeof req.body.comment === 'string' ? req.body.comment.trim() : '';

  if (!isValidId(productId)) {
    return res.status(400).json({ message: 'Invalid product ID.' });
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Choose a rating from 1 to 5 stars.' });
  }

  if (comment.length < 3 || comment.length > 1000) {
    return res.status(400).json({
      message: 'Review text must be between 3 and 1000 characters.',
    });
  }

  try {
    const eligibility = await canReviewProduct(req.user._id, productId);

    if (!eligibility.product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    if (!eligibility.allowed) {
      return res.status(403).json({ message: eligibility.reason });
    }

    const review = await Review.create({
      productId,
      userId: req.user._id,
      rating,
      comment,
    });

    return res.status(201).json({
      message: 'Review submitted successfully.',
      review,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'You have already reviewed this product. Edit your existing review instead.',
      });
    }

    console.error('Create review error:', error);
    return res.status(500).json({ message: 'Unable to submit your review.' });
  }
};

// @route PATCH /api/reviews/:reviewId
// @access Private - review owner
exports.updateReview = async (req, res) => {
  const { reviewId } = req.params;
  const rating = Number(req.body.rating);
  const comment =
    typeof req.body.comment === 'string' ? req.body.comment.trim() : '';

  if (!isValidId(reviewId)) {
    return res.status(400).json({ message: 'Invalid review ID.' });
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Choose a rating from 1 to 5 stars.' });
  }

  if (comment.length < 3 || comment.length > 1000) {
    return res.status(400).json({
      message: 'Review text must be between 3 and 1000 characters.',
    });
  }

  try {
    const review = await Review.findOne({
      _id: reviewId,
      userId: req.user._id,
    });

    if (!review) {
      return res.status(404).json({
        message: 'Review not found, or you do not have permission to edit it.',
      });
    }

    review.rating = rating;
    review.comment = comment;
    await review.save();

    return res.status(200).json({
      message: 'Review updated successfully.',
      review,
    });
  } catch (error) {
    console.error('Update review error:', error);
    return res.status(500).json({ message: 'Unable to update your review.' });
  }
};

// @route DELETE /api/reviews/:reviewId
// @access Private - review owner
exports.deleteReview = async (req, res) => {
  const { reviewId } = req.params;

  if (!isValidId(reviewId)) {
    return res.status(400).json({ message: 'Invalid review ID.' });
  }

  try {
    const review = await Review.findOneAndDelete({
      _id: reviewId,
      userId: req.user._id,
    });

    if (!review) {
      return res.status(404).json({
        message: 'Review not found, or you do not have permission to delete it.',
      });
    }

    return res.status(200).json({ message: 'Review deleted successfully.' });
  } catch (error) {
    console.error('Delete review error:', error);
    return res.status(500).json({ message: 'Unable to delete your review.' });
  }
};
