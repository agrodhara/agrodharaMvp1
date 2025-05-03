const { authenticateToken, authenticateFarmerToken } = require('./auth');
const {
  fpoProfileValidation,
  otpValidation,
  farmerValidation,
  phoneValidator,
  productValidator,
  weatherValidation,
  validate
} = require('./validation');
const { otpLimiter, apiLimiter } = require('./rateLimiter');

module.exports = {
  auth: {
    authenticateToken,
    authenticateFarmerToken
  },
  validation: {
    fpoProfileValidation,
    otpValidation,
    farmerValidation,
    phoneValidator,
    productValidator,
    weatherValidation,
    validate
  },
  rateLimiter: {
    otpLimiter,
    apiLimiter
  }
};