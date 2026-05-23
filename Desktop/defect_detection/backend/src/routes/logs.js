const express = require('express');
const router = express.Router();
const InspectionLog = require('../models/InspectionLog');
const { protect } = require('../middleware/auth');

// @desc    Get activity logs
// @route   GET /api/logs
// @access  Private (Admin sees all, worker sees own)
router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    let query = {};
    if (req.user.role !== 'admin') {
      // Worker sees only their own
      const empId = req.user.employee_id;
      if (empId) {
        query.employee_id = empId;
      } else {
        // Fallback if no employee_id
        query.employee_name = req.user.full_name || req.user.username;
      }
    }

    const logs = await InspectionLog.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    const total = await InspectionLog.countDocuments(query);

    res.json({
      success: true,
      data: logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
