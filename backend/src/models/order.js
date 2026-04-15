const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    required: true,
    default: 'pending'
  },
  // 收货信息
  receiverName: {
    type: String,
    required: false
  },
  receiverPhone: {
    type: String,
    required: false
  },
  receiverAddress: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;