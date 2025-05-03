const express = require('express');
const router = express.Router();
const { auth, validation } = require('../../middleware');
const { FarmerModel } = require('../../models');
const { ResponseUtils, DateUtils } = require('../../utils');
const db = require('../../config/database').pool;

// Get all farmers for FPO
router.get('/',
  auth.authenticateToken,
  async (req, res) => {
    try {
      const fpoId = req.query.fpo_id;
      if (!fpoId) {
        return ResponseUtils.badRequest(res, 'FPO ID is required');
      }
      
      // Query farmers2 table directly
      const [farmers] = await db.query(`
        SELECT 
          f.*,
          COALESCE(pc.primary_crop, '') AS primary_crop,
          COALESCE(pc.primary_quantity, 0) AS primary_quantity,
          COALESCE(tc.total_quantity, 0) AS total_quantity
        FROM farmers2 f
        LEFT JOIN (
          SELECT 
            farmer_id,
            crop_variety AS primary_crop,
            expected_harvest_quantity AS primary_quantity
          FROM farmer_crop_details fc
          WHERE (farmer_id, expected_harvest_quantity) IN (
            SELECT 
              farmer_id,
              MAX(expected_harvest_quantity)
            FROM farmer_crop_details
            GROUP BY farmer_id
          )
        ) pc ON f.farmer_id = pc.farmer_id
        LEFT JOIN (
          SELECT 
            farmer_id,
            SUM(expected_harvest_quantity) AS total_quantity
          FROM farmer_crop_details
          GROUP BY farmer_id
        ) tc ON f.farmer_id = tc.farmer_id
        WHERE f.fpo_id = ?
      `, [fpoId]);
      
      ResponseUtils.success(res, farmers);
    } catch (error) {
      console.error('Error fetching farmers:', error);
      ResponseUtils.serverError(res, error);
    }
  }
);

// Create new farmer
router.post('/',
  auth.authenticateToken,
  validation.farmerValidation,
  validation.validate,
  async (req, res) => {
    try {
      const farmerData = {
        ...req.body,
        fpo_id: req.body.fpo_id,
        
        // Ensure numeric fields are properly formatted
        total_plot_size: req.body.total_plot_size ? Number(req.body.total_plot_size) : 0.00,
        
        impact_duration_days: req.body.impact_duration_days ? Number(req.body.impact_duration_days) : null,
        // Convert empty strings to null for optional fields
        calamity_type: req.body.calamity_type || null,
        impact_severity: req.body.impact_severity || null
      };

      const farmerId = await FarmerModel.create(farmerData);
      ResponseUtils.success(res, { id: farmerId }, 'Farmer created successfully', 201);
    } catch (error) {
      console.error('Error creating farmer:', error);
      ResponseUtils.serverError(res, error);
    }
  }
);

// Get farmer by ID
router.get('/:id',
  auth.authenticateToken,
  async (req, res) => {
    try {
      const farmer = await FarmerModel.getById(req.params.id);
      if (!farmer) {
        return ResponseUtils.notFound(res, 'Farmer not found');
      }
      ResponseUtils.success(res, farmer);
    } catch (error) {
      ResponseUtils.serverError(res, error);
    }
  }
);

// Update farmer
router.put('/:id',
  auth.authenticateToken,

  async (req, res) => {
    try {
      const farmerData = {
        ...req.body,
        
      };

      await FarmerModel.update(req.params.id, farmerData);
      ResponseUtils.success(res, {}, 'Farmer updated successfully');
    } catch (error) {
      ResponseUtils.serverError(res, error);
    }
  }
);


// adding crops to fpo db
router.post('/farmer-crops',
  auth.authenticateToken,
  async (req, res) => {
  const crops = req.body;

  try {
    for (const crop of crops) {
      await db.pool.execute(
        `INSERT INTO farmer_crop_details 
          (farmer_id, crop_variety, crop_sub_variety, grade, sowing_date, farming_type, harvest_date, expected_harvest_quantity)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          crop.farmer_id,
          crop.crop_variety,
          crop.crop_sub_variety,
          crop.grade,
          crop.sowing_date,
          crop.farming_type,
          crop.harvest_date,
          crop.expected_harvest_quantity
        ]
      );
    }

    res.status(201).json({ success: true, message: "Crop details saved." });
  } catch (error) {
    console.error("Error inserting crop details:", error);
    res.status(500).json({ success: false, message: "Failed to save crop details." });
  }
});








// Delete farmer
router.delete('/:id',
  auth.authenticateToken,
  async (req, res) => {
    try {
      // Delete from farmers2 table
      await db.query('DELETE FROM farmers2 WHERE farmer_id = ?', [req.params.id]);
      ResponseUtils.success(res, {}, 'Farmer deleted successfully');
    } catch (error) {
      console.error('Error deleting farmer:', error);
      ResponseUtils.serverError(res, error);
    }
  },


// Bulk upload farmers (Excel upload or JSON array)
router.post('/bulkfarmer',
  auth.authenticateToken,
  async (req, res) => {
    try {
      const farmers = req.body;

      if (!Array.isArray(farmers) || farmers.length === 0) {
        return ResponseUtils.badRequest(res, 'Farmer array is required');
      }

      await FarmerModel.bulkCreate(farmers);

      ResponseUtils.success(res, {}, 'Farmers uploaded successfully', 201);
    } catch (error) {
      console.error('Error during bulk farmer upload:', error);
      ResponseUtils.serverError(res, error);
    }
  }
)

 



);

module.exports = router;