require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('express-async-errors');

const detectionRoutes = require('./routes/detections');
const inspectionRoutes = require('./routes/inspections');
const scrapInventoryRoutes = require('./routes/scrapInventory');
const recyclingRecommendationRoutes = require('./routes/recyclingRecommendation');
const analyticsRoutes = require('./routes/analytics');
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Database Connection
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/defect_detection';
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

connectDB();

// Routes
app.use('/api/detections', detectionRoutes);
app.use('/api/inspections', inspectionRoutes);
app.use('/api/scrap', scrapInventoryRoutes);
app.use('/api/recommend', recyclingRecommendationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/auth', authRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'Backend API is running',
    timestamp: new Date().toISOString()
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend API running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
