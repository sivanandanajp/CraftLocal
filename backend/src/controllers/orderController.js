
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');

const {
  consumePaymentSession,
} = require('./paymentController');

const roundMoney = (amount) =>
  Math.round((amount + Number.EPSILON) * 100) / 100;

const ORDER_STATUSES = [
  'Pending',
  'Processing',
  'Shipped',
  'Delivered',
  'Cancelled',
];

// Sellers can advance an item one step at a time.
// Cancellation is permitted only while an item is Pending.
const ALLOWED_TRANSITIONS = {
  Pending: ['Processing', 'Cancelled'],
  Processing: ['Shipped'],
  Shipped: ['Delivered'],
  Delivered: [],
  Cancelled: [],
};

const isSeller = (user) =>
  user && ['seller', 'creator', 'artisan'].includes(user.role);

// Determine a useful overall status without letting one seller overwrite
// the status of another seller's items.
const getOverallStatus = (items) => {
  if (!items.length) return 'Pending';

  const statuses = items.map((item) => item.status || 'Pending');

  if (statuses.every((status) => status === 'Cancelled')) {
    return 'Cancelled';
  }

  const activeStatuses = statuses.filter(
    (status) => status !== 'Cancelled'
  );

  if (
    activeStatuses.length > 0 &&
    activeStatuses.every((status) => status === 'Delivered')
  ) {
    return 'Delivered';
  }

  if (activeStatuses.includes('Shipped')) return 'Shipped';
  if (activeStatuses.includes('Processing')) return 'Processing';

  return 'Pending';
};

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  const {
    items,
    shippingAddress,
    deliveryMethod = 'standard',
    paymentMethod = 'cod',
    paymentReference,
  } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Your cart is empty.' });
  }

  if (items.length > 100) {
    return res.status(400).json({
      message: 'Too many items in one order.',
    });
  }

  if (!['standard', 'express'].includes(deliveryMethod)) {
    return res.status(400).json({
      message: 'Please select a valid delivery method.',
    });
  }

  if (!['card', 'upi', 'cod'].includes(paymentMethod)) {
    return res.status(400).json({
      message: 'Please select a valid payment method.',
    });
  }

  if (paymentMethod !== 'cod') {
    const validPayment = consumePaymentSession({
      paymentReference,
      userId: req.user._id,
      paymentMethod,
    });

    if (!validPayment) {
      return res.status(400).json({
        message:
          'Payment session is invalid, expired, or already used. Please try again.',
      });
    }
  }

  const requiredAddressFields = [
    'fullName',
    'email',
    'phone',
    'address',
    'city',
    'state',
    'postalCode',
  ];

  if (
    !shippingAddress ||
    typeof shippingAddress !== 'object' ||
    Array.isArray(shippingAddress) ||
    requiredAddressFields.some(
      (field) =>
        typeof shippingAddress[field] !== 'string' ||
        !shippingAddress[field].trim()
    )
  ) {
    return res.status(400).json({
      message: 'Please provide all required delivery details.',
    });
  }

  const email = shippingAddress.email.trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({
      message: 'Please provide a valid email address.',
    });
  }

  const quantitiesByProduct = new Map();

  for (const item of items) {
    if (
      !item ||
      typeof item.productId !== 'string' ||
      !mongoose.Types.ObjectId.isValid(item.productId) ||
      !Number.isSafeInteger(item.quantity) ||
      item.quantity < 1
    ) {
      return res.status(400).json({
        message: 'One or more cart items are invalid.',
      });
    }

    const productId = item.productId;
    const quantity =
      (quantitiesByProduct.get(productId) || 0) + item.quantity;

    if (!Number.isSafeInteger(quantity)) {
      return res.status(400).json({
        message: 'Invalid product quantity.',
      });
    }

    quantitiesByProduct.set(productId, quantity);
  }

  const session = await mongoose.startSession();

  try {
    let createdOrder;

    await session.withTransaction(async () => {
      const orderItems = [];
      let subtotal = 0;

      for (const [productId, quantity] of quantitiesByProduct) {
        const product = await Product.findById(productId).session(session);

        if (!product) {
          const error = new Error(
            'A product in your cart could not be found. Please refresh your cart.'
          );
          error.statusCode = 400;
          throw error;
        }

        if (product.stock < quantity) {
          const error = new Error(
            `Not enough stock available for "${product.name}". Please update your cart.`
          );
          error.statusCode = 409;
          throw error;
        }

        const price = roundMoney(product.price);

        if (!Number.isFinite(price) || price < 0) {
          const error = new Error(
            `The price for "${product.name}" is invalid.`
          );
          error.statusCode = 400;
          throw error;
        }

        subtotal += price * quantity;

        orderItems.push({
          productId: product._id,
          name: product.name,
          image: product.image || '',
          quantity,
          price,
          status: paymentMethod === 'cod' ? 'Pending' : 'Processing',
        });
      }

      subtotal = roundMoney(subtotal);

      const shippingFee = deliveryMethod === 'express' ? 15 : 5;
      const tax = roundMoney(subtotal * 0.08);
      const totalAmount = roundMoney(
        subtotal + shippingFee + tax
      );

      for (const item of orderItems) {
        const result = await Product.updateOne(
          {
            _id: item.productId,
            stock: { $gte: item.quantity },
          },
          {
            $inc: { stock: -item.quantity },
          },
          { session }
        );

        if (result.modifiedCount !== 1) {
          const error = new Error(
            `Stock changed for "${item.name}". Please try again.`
          );
          error.statusCode = 409;
          throw error;
        }
      }

      const isCashOnDelivery = paymentMethod === 'cod';

      const orderData = {
        userId: req.user._id,
        items: orderItems,
        shippingAddress: {
          fullName: shippingAddress.fullName.trim(),
          email,
          phone: shippingAddress.phone.trim(),
          address: shippingAddress.address.trim(),
          city: shippingAddress.city.trim(),
          state: shippingAddress.state.trim(),
          postalCode: shippingAddress.postalCode.trim(),
        },
        deliveryMethod,
        paymentMethod,
        paymentStatus: isCashOnDelivery ? 'Pending' : 'Paid',
        subtotal,
        shippingFee,
        tax,
        totalAmount,
        status: isCashOnDelivery ? 'Pending' : 'Processing',
      };

      const orders = await Order.create([orderData], { session });
      createdOrder = orders[0];
    });

    return res.status(201).json({
      message: 'Order placed successfully.',
      order: createdOrder,
    });
  } catch (error) {
    console.error('Create order error:', error);

    return res.status(error.statusCode || 500).json({
      message: error.statusCode
        ? error.message
        : 'Unable to place your order. Please try again.',
    });
  } finally {
    await session.endSession();
  }
};

// @desc    Get logged-in buyer's orders
// @route   GET /api/orders/my-orders
// @access  Private
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      userId: req.user._id,
    })
      .sort({ createdAt: -1 })
      .lean();

    // Compatibility for older orders created before item-level statuses.
    const normalizedOrders = orders.map((order) => ({
      ...order,
      items: (order.items || []).map((item) => ({
        ...item,
        status: item.status || order.status || 'Pending',
      })),
    }));

    return res.status(200).json(normalizedOrders);
  } catch (error) {
    console.error('Get orders error:', error);

    return res.status(500).json({
      message: 'Unable to retrieve your orders.',
    });
  }
};

// @desc    Get orders containing this seller's products
// @route   GET /api/orders/seller-orders
// @access  Private - seller/creator
exports.getSellerOrders = async (req, res) => {
  if (!isSeller(req.user)) {
    return res.status(403).json({
      message: 'Only sellers can access seller orders.',
    });
  }

  try {
    const sellerProducts = await Product.find({
      sellerId: req.user._id,
    })
      .select('_id')
      .lean();

    const sellerProductIds = sellerProducts.map((product) =>
      String(product._id)
    );

    if (sellerProductIds.length === 0) {
      return res.status(200).json([]);
    }

    const sellerProductIdSet = new Set(sellerProductIds);

    const orders = await Order.find({
      'items.productId': { $in: sellerProducts.map((p) => p._id) },
    })
      .sort({ createdAt: -1 })
      .lean();

    const sellerOrders = orders.map((order) => {
      const ownItems = (order.items || [])
        .filter((item) =>
          sellerProductIdSet.has(String(item.productId))
        )
        .map((item) => ({
          ...item,
          status: item.status || order.status || 'Pending',
        }));

      const sellerSubtotal = roundMoney(
        ownItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        )
      );

      // Return only the seller's items and their subtotal.
      // Do not expose the full order total for other sellers' products.
      return {
        _id: order._id,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        shippingAddress: order.shippingAddress,
        deliveryMethod: order.deliveryMethod,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        status: getOverallStatus(ownItems),
        items: ownItems,
        sellerSubtotal,
        sellerItemCount: ownItems.length,
      };
    });

    return res.status(200).json(sellerOrders);
  } catch (error) {
    console.error('Get seller orders error:', error);

    return res.status(500).json({
      message: 'Unable to retrieve seller orders.',
    });
  }
};

// @desc    Update the status of one of this seller's order items
// @route   PATCH /api/orders/seller-orders/:orderId/items/:productId/status
// @access  Private - seller/creator
exports.updateSellerOrderItemStatus = async (req, res) => {
  if (!isSeller(req.user)) {
    return res.status(403).json({
      message: 'Only sellers can update seller order statuses.',
    });
  }

  const { orderId, productId } = req.params;
  const { status: nextStatus } = req.body;

  if (
    !mongoose.Types.ObjectId.isValid(orderId) ||
    !mongoose.Types.ObjectId.isValid(productId)
  ) {
    return res.status(400).json({
      message: 'Invalid order or product ID.',
    });
  }

  if (!ORDER_STATUSES.includes(nextStatus)) {
    return res.status(400).json({
      message: 'Please select a valid order status.',
    });
  }

  try {
    // Confirm this seller owns the product before touching the order.
    const ownedProduct = await Product.findOne({
      _id: productId,
      sellerId: req.user._id,
    })
      .select('_id')
      .lean();

    if (!ownedProduct) {
      return res.status(404).json({
        message: 'Product not found in your store.',
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      'items.productId': ownedProduct._id,
    });

    if (!order) {
      return res.status(404).json({
        message: 'Order not found for one of your products.',
      });
    }

    const orderItem = order.items.find(
      (item) => String(item.productId) === String(ownedProduct._id)
    );

    if (!orderItem) {
      return res.status(404).json({
        message: 'This product is not part of the order.',
      });
    }

    const currentStatus = orderItem.status || order.status || 'Pending';

    if (!(ALLOWED_TRANSITIONS[currentStatus] || []).includes(nextStatus)) {
      return res.status(400).json({
        message: `Cannot change status from ${currentStatus} to ${nextStatus}.`,
        allowedNextStatuses: ALLOWED_TRANSITIONS[currentStatus] || [],
      });
    }

    // Update only this seller's matching item, not another seller's items.
    orderItem.status = nextStatus;

    // Recalculate the overall order status for buyer-facing order history.
    order.status = getOverallStatus(order.items);
    await order.save();

    const ownItems = order.items
      .filter((item) => String(item.productId) === String(ownedProduct._id))
      .map((item) => ({
        ...item.toObject(),
        status: item.status || 'Pending',
      }));

    return res.status(200).json({
      message: 'Order item status updated successfully.',
      orderId: order._id,
      orderStatus: order.status,
      items: ownItems,
    });
  } catch (error) {
    console.error('Update seller order status error:', error);

    return res.status(500).json({
      message: 'Unable to update order status.',
    });
  }
};
