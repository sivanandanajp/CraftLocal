
const crypto = require('crypto');

// In-memory payment sessions for the college project.
// These are lost whenever the backend restarts.
const paymentSessions = new Map();

const SESSION_LIFETIME_MS = 5 * 60 * 1000;

// POST /api/orders/simulate-payment
exports.simulatePayment = async (req, res) => {
  try {
    const { paymentMethod } = req.body;

    if (!['card', 'upi'].includes(paymentMethod)) {
      return res.status(400).json({
        message: 'Select card or UPI to continue.',
      });
    }

    const paymentReference = `SIM-${crypto
      .randomBytes(12)
      .toString('hex')
      .toUpperCase()}`;

    paymentSessions.set(paymentReference, {
      userId: String(req.user._id),
      paymentMethod,
      status: 'Paid',
      expiresAt: Date.now() + SESSION_LIFETIME_MS,
      used: false,
    });

    return res.status(200).json({
      success: true,
      paymentStatus: 'Paid',
      paymentReference,
      message: 'Payment simulation completed successfully.',
    });
  } catch (error) {
    console.error('Payment simulation error:', error);

    return res.status(500).json({
      message: 'Unable to process the payment. Please try again.',
    });
  }
};

// Internal helper for orderController.
// This checks the user, method, expiry, and single-use status.
exports.consumePaymentSession = ({
  paymentReference,
  userId,
  paymentMethod,
}) => {
  const payment = paymentSessions.get(paymentReference);

  if (!payment) return false;

  if (
    payment.userId !== String(userId) ||
    payment.paymentMethod !== paymentMethod ||
    payment.status !== 'Paid' ||
    payment.used ||
    payment.expiresAt < Date.now()
  ) {
    return false;
  }

  payment.used = true;
  paymentSessions.delete(paymentReference);

  return true;
};
