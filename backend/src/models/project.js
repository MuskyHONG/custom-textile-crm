const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  parameters: {
    type: Object,
    required: true
  },
  basePrice: {
    type: Number,
    required: false
  },
  processCost: {
    type: Number,
    required: false
  },
  discount: {
    type: Number,
    required: false
  },
  tax: {
    type: Number,
    required: false
  },
  finalPrice: {
    type: Number,
    required: false
  },
  discountPrice: {
    type: Number,
    required: false
  },
  status: {
    type: String,
    required: true,
    default: 'pending'
  }
}, {
  timestamps: true
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;