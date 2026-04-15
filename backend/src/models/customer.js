const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  customerId: {
    type: String,
    required: false,
    unique: true
  },
  phone: {
    type: String,
    required: false
  },
  remark: {
    type: String,
    required: false
  },
  // 关联项目（咨询记录）
  projects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  }],
  // 关联订单（成交记录）
  orders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }]
}, {
  timestamps: true
});

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;