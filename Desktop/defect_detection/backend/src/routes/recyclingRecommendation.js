const express = require('express');
const router = express.Router();
const RecyclingLog = require('../models/RecyclingLog');

// POST - Get recycling recommendation
router.post('/', async (req, res) => {
  try {
    const { defectType, severity, confidence, metalType } = req.body;

    if (!defectType || !severity) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: defectType, severity'
      });
    }

    let recommendation = {
      action: '',
      method: '',
      costSaved: 0,
      co2Saved: 0
    };

    // Recommendation Logic
    if (defectType === 'Scratches') {
      recommendation = {
        action: severity === 'High' ? 'Surface Grinding' : 'Re-polish',
        method: 'Surface Polishing & Finishing',
        costSaved: severity === 'High' ? 100 : 150,
        co2Saved: 10
      };
    } else if (defectType === 'Crazing') {
      recommendation = {
        action: severity === 'High' ? 'Scrap Recycling' : 'Reuse',
        method: severity === 'High' ? 'Thermal/Mechanical Recycling' : 'Direct Reuse After Inspection',
        costSaved: severity === 'High' ? 80 : 100,
        co2Saved: severity === 'High' ? 25 : 15
      };
    } else if (defectType === 'Inclusion' || defectType === 'Patches') {
      recommendation = {
        action: 'Chemical Recycling',
        method: 'Acid/Base Treatment & Recovery',
        costSaved: 200,
        co2Saved: 20
      };
    } else if (defectType === 'Rolled-in Scale' || defectType === 'Pitted Surface') {
      recommendation = {
        action: 'Thermal Recycling',
        method: 'High-Temperature Melting & Purification',
        costSaved: 180,
        co2Saved: 22
      };
    } else {
      recommendation = {
        action: 'Scrap Recycling',
        method: 'Standard Recycling Process',
        costSaved: 120,
        co2Saved: 18
      };
    }

    res.json({
      success: true,
      data: {
        ...recommendation,
        defectType,
        severity,
        confidence: confidence || 0.8
      },
      message: 'Recycling recommendation generated successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating recommendation',
      error: error.message
    });
  }
});

// POST - Log recycling action
router.post('/log', async (req, res) => {
  try {
    const { detectionId, defectType, actionTaken, costSaved, co2Saved, metalWeight } = req.body;

    const log = new RecyclingLog({
      detectionId,
      defectType,
      actionTaken,
      costSaved,
      co2Saved,
      metalWeight
    });

    await log.save();

    res.status(201).json({
      success: true,
      data: log,
      message: 'Recycling action logged successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error logging recycling action',
      error: error.message
    });
  }
});

module.exports = router;
