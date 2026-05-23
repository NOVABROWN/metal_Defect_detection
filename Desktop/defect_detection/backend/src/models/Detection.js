const mongoose = require('mongoose');

const detectionSchema = new mongoose.Schema({
  // ── Image Info ─────────────────────────────────────────────
  imageUrl: {
    type: String,
    required: true
  },
  imageName: {
    type: String,       // original filename e.g. "scratches_243.jpg"
    default: ''
  },
  imagePath: {
    type: String,       // full disk/server path e.g. "/uploads/1778486829908-scratches_243.jpg"
    default: ''
  },
  imageFileName: {
    type: String,
    required: true
  },

  // ── User / Operator ─────────────────────────────────────────
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  inspectedBy: {
    type: String,       // username at time of inspection
    default: 'Unknown'
  },

  // ── Prediction Results ──────────────────────────────────────
  defectType: {
    type: String,
    enum: ['Crazing', 'Inclusion', 'Patches', 'Pitted Surface', 'Rolled-in Scale', 'Scratches'],
    required: true
  },
  // Alias for defectType — matches requested schema field "prediction_label"
  predictionLabel: {
    type: String,
    default: ''
  },
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  // Alias for confidence — matches requested schema field "confidence_score"
  confidenceScore: {
    type: Number,
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

  // ── Metadata ────────────────────────────────────────────────
  metalType: {
    type: String,
    default: 'Steel'
  },
  detectionType: {
    type: String,
    enum: ['AI-Automated', 'Manual'],
    default: 'AI-Automated'
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

// Compound index for fast pagination queries
detectionSchema.index({ createdAt: -1, userId: 1 });
detectionSchema.index({ defectType: 1 });
detectionSchema.index({ severity: 1 });

module.exports = mongoose.model('Detection', detectionSchema);

