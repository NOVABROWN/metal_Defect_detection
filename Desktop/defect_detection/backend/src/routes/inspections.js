const express = require('express');
const router = express.Router();
const Detection = require('../models/Detection');
const { protect } = require('../middleware/auth');

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/inspections/stats  — aggregated summary stats from MongoDB
// ─────────────────────────────────────────────────────────────────────────────
router.get('/stats', protect, async (req, res) => {
  try {
    let matchQuery = {};
    if (req.user.role !== 'admin') {
      matchQuery.userId = req.user._id;
    }

    const [totalResult, byType, bySeverity, recent7Days] = await Promise.all([
      // Total count
      Detection.countDocuments(matchQuery),

      // Grouped by defect type
      Detection.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: '$defectType',
            count: { $sum: 1 },
            avgConfidence: { $avg: '$confidence' }
          }
        },
        { $sort: { count: -1 } }
      ]),

      // Grouped by severity
      Detection.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: '$severity',
            count: { $sum: 1 }
          }
        }
      ]),

      // Last 7 days trend
      Detection.aggregate([
        {
          $match: {
            ...matchQuery,
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    // Average confidence across all records
    const avgConfResult = await Detection.aggregate([
      { $match: matchQuery },
      { $group: { _id: null, avgConf: { $avg: '$confidence' } } }
    ]);
    const avgConfidence = avgConfResult.length > 0 ? avgConfResult[0].avgConf : 0;

    // Most recent inspection timestamp
    const latest = await Detection.findOne(matchQuery).sort({ createdAt: -1 }).select('createdAt');

    res.json({
      success: true,
      data: {
        totalInspections: totalResult,
        avgConfidence: Math.round(avgConfidence * 10000) / 100, // as percentage
        byDefectType: byType,
        bySeverity,
        trend7Days: recent7Days,
        lastInspectionAt: latest?.createdAt || null
      },
      message: 'Inspection stats retrieved successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving inspection stats',
      error: error.message
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/inspections  — paginated list with filtering & search
// Query params: page, limit, defectType, severity, dateFrom, dateTo, search
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', protect, async (req, res) => {
  try {
    const page     = parseInt(req.query.page)  || 1;
    const limit    = parseInt(req.query.limit) || 10;
    const skip     = (page - 1) * limit;

    // Build filter query
    let query = {};

    // Role-based scoping
    if (req.user.role !== 'admin') {
      query.userId = req.user._id;
    }

    // Filter by defect type
    if (req.query.defectType && req.query.defectType !== 'all') {
      query.defectType = req.query.defectType;
    }

    // Filter by severity
    if (req.query.severity && req.query.severity !== 'all') {
      query.severity = req.query.severity;
    }

    // Date range filter
    if (req.query.dateFrom || req.query.dateTo) {
      query.createdAt = {};
      if (req.query.dateFrom) {
        query.createdAt.$gte = new Date(req.query.dateFrom);
      }
      if (req.query.dateTo) {
        // Include the entire dateTo day
        const toDate = new Date(req.query.dateTo);
        toDate.setHours(23, 59, 59, 999);
        query.createdAt.$lte = toDate;
      }
    }

    // Search by image filename or defect type (case-insensitive)
    if (req.query.search && req.query.search.trim() !== '') {
      const searchRegex = new RegExp(req.query.search.trim(), 'i');
      query.$or = [
        { imageName: searchRegex },
        { imageFileName: searchRegex },
        { defectType: searchRegex },
        { inspectedBy: searchRegex }
      ];
    }

    const [detections, total] = await Promise.all([
      Detection.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-rawPredictions'),  // exclude heavy field from list view
      Detection.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: detections,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      },
      message: 'Inspection records retrieved successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving inspection records',
      error: error.message
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/inspections/:id  — single inspection detail (with rawPredictions)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/:id', protect, async (req, res) => {
  try {
    const detection = await Detection.findById(req.params.id);

    if (!detection) {
      return res.status(404).json({
        success: false,
        message: 'Inspection record not found'
      });
    }

    // Workers can only access their own records
    if (
      req.user.role !== 'admin' &&
      detection.userId &&
      detection.userId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this inspection record'
      });
    }

    res.json({
      success: true,
      data: detection,
      message: 'Inspection record retrieved successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving inspection record',
      error: error.message
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/inspections/:id  — admin only
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/:id', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can delete inspection records'
      });
    }

    const detection = await Detection.findById(req.params.id);

    if (!detection) {
      return res.status(404).json({
        success: false,
        message: 'Inspection record not found'
      });
    }

    await Detection.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      data: { deletedId: detection._id },
      message: 'Inspection record deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting inspection record',
      error: error.message
    });
  }
});

module.exports = router;
