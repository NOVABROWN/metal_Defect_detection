const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');
const cloudinary = require('cloudinary').v2;
const Detection = require('../models/Detection');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }
});

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// POST - Upload image and get detection
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Upload to Cloudinary
    const uploadStream = cloudinary.uploader.upload_stream({
      folder: 'defect-detection',
      resource_type: 'auto'
    }, async (error, result) => {
      if (error) {
        return res.status(500).json({
          success: false,
          message: 'Image upload failed',
          error: error.message
        });
      }

      try {
        // Send to AI Service for prediction
        const formData = new FormData();
        formData.append('file', new Blob([req.file.buffer]), req.file.originalname);

        const aiResponse = await axios.post(
          `${AI_SERVICE_URL}/predict`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );

        if (!aiResponse.data.success) {
          return res.status(500).json({
            success: false,
            message: 'AI prediction failed'
          });
        }

        const { defect_type, confidence, severity } = aiResponse.data.data;

        // Save to database
        const detection = new Detection({
          imageUrl: result.secure_url,
          imageFileName: req.file.originalname,
          defectType: defect_type,
          confidence,
          severity,
          metalType: 'Steel' // Default, can be determined by another model
        });

        await detection.save();

        res.status(201).json({
          success: true,
          data: {
            detectionId: detection._id,
            imageUrl: result.secure_url,
            defectType,
            confidence,
            severity
          },
          message: 'Detection completed successfully'
        });

      } catch (error) {
        console.error('Error in detection processing:', error);
        res.status(500).json({
          success: false,
          message: 'Error processing detection',
          error: error.message
        });
      }
    });

    uploadStream.end(req.file.buffer);

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Upload failed',
      error: error.message
    });
  }
});

// GET - Get detection result by ID
router.get('/:id', async (req, res) => {
  try {
    const detection = await Detection.findById(req.params.id);

    if (!detection) {
      return res.status(404).json({
        success: false,
        message: 'Detection not found'
      });
    }

    res.json({
      success: true,
      data: detection,
      message: 'Detection retrieved successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving detection',
      error: error.message
    });
  }
});

// GET - Get all detections with pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const detections = await Detection.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Detection.countDocuments();

    res.json({
      success: true,
      data: detections,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      message: 'Detections retrieved successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving detections',
      error: error.message
    });
  }
});

// DELETE - Delete detection
router.delete('/:id', async (req, res) => {
  try {
    const detection = await Detection.findByIdAndDelete(req.params.id);

    if (!detection) {
      return res.status(404).json({
        success: false,
        message: 'Detection not found'
      });
    }

    res.json({
      success: true,
      data: { deletedId: detection._id },
      message: 'Detection deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting detection',
      error: error.message
    });
  }
});

module.exports = router;
