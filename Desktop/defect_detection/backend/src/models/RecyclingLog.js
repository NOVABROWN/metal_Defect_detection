const mongoose = require('mongoose');

const recyclingLogSchema = new mongoose.Schema({
  detectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Detection'
  },
  defectType: {
    type: String,
    required: true
  },
  severity: String,
  actionTaken: {
    type: String,
    required: true,
    enum: ['Re-polish', 'Chemical Recycling', 'Thermal Recycling', 'Scrap Recycling', 'Reuse']
  },
  method: String,
  costSaved: {
    type: Number,
    default: 0
  },
  co2Saved: {
    type: Number,
    default: 0
  },
  metalWeight: Number,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('RecyclingLog', recyclingLogSchema);
