const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  parameters: {
    type: Object,
    required: true
  }
}, {
  timestamps: true
});

const Template = mongoose.model('Template', templateSchema);

module.exports = Template;