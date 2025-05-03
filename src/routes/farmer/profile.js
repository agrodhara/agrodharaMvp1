const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware');
const { FarmerModel } = require('../../models');
const { ResponseUtils } = require('../../utils');

// Get farmer profile
router.get('/',
  auth.authenticateFarmerToken,
  async (req, res) => {
    try {
      const farmer = await FarmerModel.findById(req.farmer.id);
      if (!farmer) {
        return ResponseUtils.notFound(res, 'Farmer not found');
      }
      ResponseUtils.success(res, farmer);
    } catch (error) {
      ResponseUtils.serverError(res, error);
    }
  }
);

module.exports = router;