const express = require('express');
const router = express.Router();
const ScrapInventory = require('../models/ScrapInventory');

// POST - Add new scrap item
router.post('/add', async (req, res) => {
  try {
    const { metalType, quantity, status, location, notes, estimatedValue } = req.body;

    if (!metalType || !quantity || !status || !location) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const scrapItem = new ScrapInventory({
      metalType,
      quantity,
      status,
      location,
      notes,
      estimatedValue: estimatedValue || 0
    });

    await scrapItem.save();

    res.status(201).json({
      success: true,
      data: scrapItem,
      message: 'Scrap item added successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding scrap item',
      error: error.message
    });
  }
});

// GET - Get all scrap inventory
router.get('/all', async (req, res) => {
  try {
    const { status, metalType } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (metalType) filter.metalType = metalType;

    const items = await ScrapInventory.find(filter).sort({ addedDate: -1 });

    const summary = {
      total: items.length,
      totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
      byStatus: {},
      byMetal: {}
    };

    items.forEach(item => {
      summary.byStatus[item.status] = (summary.byStatus[item.status] || 0) + item.quantity;
      summary.byMetal[item.metalType] = (summary.byMetal[item.metalType] || 0) + item.quantity;
    });

    res.json({
      success: true,
      data: items,
      summary,
      message: 'Scrap inventory retrieved successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving scrap inventory',
      error: error.message
    });
  }
});

// PUT - Update scrap item
router.put('/update/:id', async (req, res) => {
  try {
    const { quantity, status, location, notes, estimatedValue } = req.body;

    const scrapItem = await ScrapInventory.findByIdAndUpdate(
      req.params.id,
      {
        quantity,
        status,
        location,
        notes,
        estimatedValue,
        lastUpdated: Date.now()
      },
      { new: true }
    );

    if (!scrapItem) {
      return res.status(404).json({
        success: false,
        message: 'Scrap item not found'
      });
    }

    res.json({
      success: true,
      data: scrapItem,
      message: 'Scrap item updated successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating scrap item',
      error: error.message
    });
  }
});

// DELETE - Delete scrap item
router.delete('/delete/:id', async (req, res) => {
  try {
    const scrapItem = await ScrapInventory.findByIdAndDelete(req.params.id);

    if (!scrapItem) {
      return res.status(404).json({
        success: false,
        message: 'Scrap item not found'
      });
    }

    res.json({
      success: true,
      data: { deletedId: scrapItem._id },
      message: 'Scrap item deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting scrap item',
      error: error.message
    });
  }
});

module.exports = router;
