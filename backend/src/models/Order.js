const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 }
  }],
  shippingAddress: {
    fullName: String,
    addressLine: String,
    street: String,
    city: String,
    postalCode: String,
    zipCode: String,
    phone: String
  },
  totalAmount: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);