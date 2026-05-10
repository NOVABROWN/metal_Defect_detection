const mongoose = require('mongoose');

const detectionSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  imageFileName: {
    type: String,
    required: true
  },
  defectType: {
    type: String,
    enum: ['Crazing', 'Inclusion', 'Patches', 'Pitted Surface', 'Rolled-in Scale', 'Scratches'],
    required: true
  },
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  severity: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    required: true
  },
  rawPredictions: {
    type: Map,
    of: Number
  },
  metalType: {
    type: String,
    default: 'Steel'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'processed', 'archived'],
    default: 'processed'
  }
});

module.exports = mongoose.model('Detection', detectionSchema);
