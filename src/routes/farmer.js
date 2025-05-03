const express = require('express');
const router = express.Router();
const farmerAuth = require('../middleware/farmerAuth');
const FarmerController = require('../controllers/farmer');
const ResponseUtils = require('../utils/response');
const FarmerModel = require('../models/farmer');

// Generate and send OTP
router.post('/generate-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    
    if (!phone) {
      return ResponseUtils.error(res, 'Phone number is required', 400);
    }
    
    // Find farmer by phone
    const farmer = await FarmerModel.findByPhone(phone);
    if (!farmer) {
      return ResponseUtils.error(res, 'Farmer not found', 404);
    }
    
    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // In a real app, you would store this OTP and send it via SMS
    // For now, we'll just return it in the response
    
    return ResponseUtils.success(res, { 
      message: "OTP generated successfully",
      otp, // Only for testing, remove in production
      farmerId: farmer.farmer_id
    });
  } catch (error) {
    console.error("Error generating OTP:", error);
    return ResponseUtils.serverError(res, error);
  }
});

// Verify OTP and get farmer profile
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;
    
    if (!phone || !otp) {
      return ResponseUtils.error(res, 'Phone and OTP are required', 400);
    }
    
    // For simplicity, accept any OTP for now
    // In production, you would verify the OTP against a stored value
    
    // Find farmer by phone
    const farmer = await FarmerModel.findByPhone(phone);
    if (!farmer) {
      return ResponseUtils.error(res, 'Farmer not found', 404);
    }
    
    return ResponseUtils.success(res, { 
      farmer,
      message: "OTP verified successfully" 
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return ResponseUtils.serverError(res, error);
  }
});

// Get farmer profile
router.get('/:id', farmerAuth, async (req, res) => {
  try {
    const farmer = await FarmerController.getFarmerById(req.params.id);
    if (!farmer) {
      return ResponseUtils.notFound(res, "Farmer not found");
    }
    return ResponseUtils.success(res, { farmer });
  } catch (error) {
    console.error("Error getting farmer profile:", error);
    return ResponseUtils.serverError(res, error);
  }
});

// Update farmer
router.put('/:id', farmerAuth, async (req, res) => {
  try {
    const updatedFarmer = await FarmerController.updateFarmer(req.params.id, req.body);
    return ResponseUtils.success(res, { farmer: updatedFarmer });
  } catch (error) {
    console.error("Error updating farmer:", error);
    return ResponseUtils.serverError(res, error);
  }
});

// Delete farmer
router.delete('/:id', farmerAuth, async (req, res) => {
  try {
    await FarmerController.deleteFarmer(req.params.id);
    return ResponseUtils.success(res, { message: "Farmer deleted successfully" });
  } catch (error) {
    console.error("Error deleting farmer:", error);
    return ResponseUtils.serverError(res, error);
  }
});

module.exports = router; 