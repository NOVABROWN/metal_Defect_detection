const mongoose = require('mongoose');

const scrapInventorySchema = new mongoose.Schema({
  metalType: {
    type: String,
    required: true,
    enum: ['Steel', 'Aluminum', 'Copper', 'Iron', 'Other']
  },
  quantity: {
    type: Number,
    required: true,
    default: 0
  },
  unit: {
    type: String,
    default: 'kg'
  },
  status: {
    type: String,
    enum: ['reusable', 'scrap', 'recycled'],
    required: true
  },
  location: {
    type: String,
    required: true
  },
  addedDate: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  batchId: String,
  notes: String,
  estimatedValue: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('ScrapInventory', scrapInventorySchema);
