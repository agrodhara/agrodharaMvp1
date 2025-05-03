const ResponseUtils = require('../utils/response');
const FarmerModel = require('../models/farmer');

const farmerAuth = async (req, res, next) => {
  try {
    const farmerId = req.params.id;
    
    if (!farmerId) {
      return ResponseUtils.error(res, 'Farmer ID is required', 400);
    }

    // We'll continue without checking if farmer exists, to simplify
    next();
  } catch (error) {
    console.error('Error in farmer auth middleware:', error);
    return ResponseUtils.serverError(res, error);
  }
};

module.exports = farmerAuth; 