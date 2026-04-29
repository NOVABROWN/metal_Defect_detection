const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');
const Detection = require('../models/Detection');
const fs = require('fs');
const path = require('path');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
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

    console.log('File received:', req.file.filename);

    try {
      // Read file and send to AI Service for prediction
      const fs = require('fs');
      const FormData = require('form-data');
      
      const fileStream = fs.createReadStream(req.file.path);
      const formData = new FormData();
      formData.append('file', fileStream, {
        filename: req.file.filename,
        contentType: req.file.mimetype
      });

      console.log('Sending to AI service:', AI_SERVICE_URL);
      
      const aiResponse = await axios.post(
        `${AI_SERVICE_URL}/predict`,
        formData,
        { 
          headers: formData.getHeaders(),
          timeout: 30000
        }
      );

      console.log('AI Response:', aiResponse.data);

      if (!aiResponse.data.success) {
        // Clean up uploaded file on AI error
        fs.unlink(req.file.path, (err) => {
          if (err) console.error('Error deleting file:', err);
        });
        
        return res.status(500).json({
          success: false,
          message: 'AI prediction failed: ' + (aiResponse.data.message || 'Unknown error')
        });
      }

      const { defect_type, confidence, severity } = aiResponse.data.data;

      // Save to database
      const detection = new Detection({
        imageUrl: `/uploads/${req.file.filename}`,
        imageFileName: req.file.originalname,
        defectType: defect_type,
        confidence,
        severity,
        metalType: 'Steel'
      });

      await detection.save();

      res.status(201).json({
        success: true,
        data: {
          detectionId: detection._id,
          imageUrl: `/uploads/${req.file.filename}`,
          defectType: defect_type,
          confidence,
          severity
        },
        message: 'Detection completed successfully'
      });

    } catch (error) {
      // Clean up uploaded file on error
      if (req.file) {
        const fs = require('fs');
        fs.unlink(req.file.path, (err) => {
          if (err) console.error('Error deleting file:', err);
        });
      }
      
      console.error('Error in detection processing - Full Error:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      
      res.status(500).json({
        success: false,
        message: 'Error processing detection: ' + (error.message || 'Unknown error'),
        details: {
          code: error.code,
          aiServiceUrl: AI_SERVICE_URL
        }
      });
    }

  } catch (error) {
    // Clean up uploaded file on error
    if (req.file) {
      const fs = require('fs');
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
    
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Upload failed: ' + error.message
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
