const express = require('express');
const router = express.Router();
const Detection = require('../models/Detection');
const RecyclingLog = require('../models/RecyclingLog');
const ScrapInventory = require('../models/ScrapInventory');

// GET - Analytics dashboard data
router.get('/', async (req, res) => {
  try {
    const totalDetections = await Detection.countDocuments();
    const totalRecyclingActions = await RecyclingLog.countDocuments();
    const totalScrapInventory = await ScrapInventory.countDocuments();

    // Get statistics
    const detectionsByType = await Detection.aggregate([
      {
        $group: {
          _id: '$defectType',
          count: { $sum: 1 },
          avgConfidence: { $avg: '$confidence' }
        }
      }
    ]);

    const severityDistribution = await Detection.aggregate([
      {
        $group: {
          _id: '$severity',
          count: { $sum: 1 }
        }
      }
    ]);

    const recyclingStats = await RecyclingLog.aggregate([
      {
        $group: {
          _id: '$actionTaken',
          count: { $sum: 1 },
          totalCostSaved: { $sum: '$costSaved' },
          totalCo2Saved: { $sum: '$co2Saved' }
        }
      }
    ]);

    const scrapByType = await ScrapInventory.aggregate([
      {
        $group: {
          _id: '$metalType',
          totalQuantity: { $sum: '$quantity' },
          totalValue: { $sum: '$estimatedValue' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Calculate metrics
    const recyclingLogs = await RecyclingLog.find();
    const totalCostSaved = recyclingLogs.reduce((sum, log) => sum + log.costSaved, 0);
    const totalCo2Saved = recyclingLogs.reduce((sum, log) => sum + log.co2Saved, 0);

    const inventory = await ScrapInventory.find();
    const totalScrapQuantity = inventory.reduce((sum, item) => sum + item.quantity, 0);
    const reusablePercentage = totalScrapQuantity > 0
      ? ((inventory.filter(i => i.status === 'reusable').reduce((sum, i) => sum + i.quantity, 0)) / totalScrapQuantity) * 100
      : 0;

    res.json({
      success: true,
      data: {
        summary: {
          totalDetections,
          totalRecyclingActions,
          totalScrapInventory,
          totalCostSaved: Math.round(totalCostSaved * 100) / 100,
          totalCo2Saved: Math.round(totalCo2Saved * 100) / 100,
          reusedMetalPercentage: Math.round(reusablePercentage * 100) / 100
        },
        detectionsByType,
        severityDistribution,
        recyclingStats,
        scrapByType,
        trend: {
          detectionsTrend: await getDetectionsTrend(),
          recyclingTrend: await getRecyclingTrend()
        }
      },
      message: 'Analytics data retrieved successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving analytics',
      error: error.message
    });
  }
});

async function getDetectionsTrend() {
  const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  return await Detection.aggregate([
    {
      $match: {
        createdAt: { $gte: last7Days }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);
}

async function getRecyclingTrend() {
  const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  return await RecyclingLog.aggregate([
    {
      $match: {
        timestamp: { $gte: last7Days }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
        },
        costSaved: { $sum: '$costSaved' },
        co2Saved: { $sum: '$co2Saved' }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);
}

module.exports = router;
