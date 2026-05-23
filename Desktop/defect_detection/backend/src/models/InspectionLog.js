const mongoose = require('mongoose');

const inspectionLogSchema = new mongoose.Schema({
  employee_id: {
    type: String,
    required: true
  },
  employee_name: {
    type: String,
    required: true
  },
  image_name: {
    type: String,
    required: true
  },
  image_path: {
    type: String,
    required: true
  },
  prediction: {
    type: String,
    required: true
  },
  confidence_score: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  detection_type: {
    type: String,
    default: 'uploaded image'
  },
  action: {
    type: String,
    required: true
  }
});

// Indexes for faster querying
inspectionLogSchema.index({ timestamp: -1 });
inspectionLogSchema.index({ employee_id: 1 });

module.exports = mongoose.model('InspectionLog', inspectionLogSchema);
