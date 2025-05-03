const express = require('express');
const router = express.Router();
const profileRouter = require('./profile');
const { FarmerModel } = require('../../models');
const { ResponseUtils } = require('../../utils');
const { auth } = require('../../middleware');

// Use profile router
router.use('/profile', profileRouter);

// Get farmer by ID
router.get('/:id', auth.authenticateFarmerToken, async (req, res) => {
  try {
    const farmerId = req.params.id;
    
    // Improve logging for debugging
    console.log(`Farmer ID from params: ${farmerId}`);
    console.log(`Farmer ID from token: ${req.farmer.farmerId}`);
    
    // Verify the farmer is accessing their own data
    if (req.farmer.farmerId != farmerId) {
      console.log(`Access denied: Token farmerId ${req.farmer.farmerId} does not match requested ID ${farmerId}`);
      return ResponseUtils.forbidden(res, 'Access denied');
    }
    
    // Get farmer data with FPO details
    const farmer = await FarmerModel.getByIdWithFpo(farmerId);
    if (!farmer) {
      return ResponseUtils.notFound(res, 'Farmer not found');
    }
    
    ResponseUtils.success(res, { success: true, data: farmer });
  } catch (error) {
    console.error('Error fetching farmer by ID:', error);
    ResponseUtils.serverError(res, error);
  }
});

module.exports = router;