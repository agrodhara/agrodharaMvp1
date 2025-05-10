const express = require('express');
const router = express.Router();
const CropModel = require('../../models/cropModel');

// GET all crop varieties
router.get('/crop-varieties', async (req, res) => {
  try {
    const varieties = await CropModel.getCropVarieties();
    res.json(varieties);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch crop varieties' });
  }
});

// GET sub-varieties by crop_variety_id
router.get('/sub-varieties/:id', async (req, res) => {
  try {
    const subs = await CropModel.getSubVarietiesByCropId(req.params.id);
    res.json(subs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sub varieties' });
  }
});

// GET all grades
router.get('/grades', async (req, res) => {
  try {
    const grades = await CropModel.getGrades();
    res.json(grades);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch grades' });
  }
});

// GET all farming types
router.get('/farming-types', async (req, res) => {
  try {
    const types = await CropModel.getFarmingTypes();
    res.json(types);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch farming types' });
  }
});






router.get('/sub-varieties', async (req, res) => {
    try {
      const subs = await CropModel.getAllSubVarieties();
      res.json(subs);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch all sub varieties' });
    }
  });

module.exports = router;
