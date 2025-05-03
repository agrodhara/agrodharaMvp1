const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { OtpService, AuthService } = require('../../services');
const { FarmerModel } = require('../../models');
const { ResponseUtils } = require('../../utils');

// Send OTP to farmer
router.post('/send-otp',
  body('phone').matches(/^[0-9]{10}$/).withMessage('Invalid phone number format'),
  async (req, res) => {
    console.log('Received send-otp request with body:', JSON.stringify(req.body));
    
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('Validation errors:', JSON.stringify(errors.array()));
        return ResponseUtils.validationError(res, errors.array());
      }

      const { phone } = req.body;
      console.log(`Processing OTP send for phone: ${phone}`);

      // Check if farmer exists
      console.log('Looking up farmer by phone number...');
      const farmer = await FarmerModel.findByPhone(phone);
      if (!farmer) {
        console.log('Farmer not found for phone:', phone);
        return ResponseUtils.notFound(res, 'Farmer not found with this phone number');
      }
      console.log('Found farmer:', farmer.farmer_id);

      try {
        console.log('Generating and sending OTP...');
        const result = await OtpService.sendFarmerOtp(phone);
        console.log('OTP send result:', JSON.stringify({
          ...result,
          otp: result.otp ? '***MASKED***' : 'none'
        }));
        
        // In development, return OTP for testing
        const devResponse = process.env.NODE_ENV === 'development' 
          ? { otp: result.otp } 
          : {};
          
        const responseData = { 
          message: 'OTP sent successfully',
          ...devResponse
        };
        console.log('Sending successful response:', JSON.stringify({
          ...responseData,
          otp: responseData.otp ? '***MASKED***' : 'none'
        }));
        
        ResponseUtils.success(res, responseData);
      } catch (otpError) {
        console.error('Error generating or sending OTP:', otpError);
        ResponseUtils.error(res, 'Failed to send OTP. Please try again later.', 500);
      }
    } catch (error) {
      console.error('Error in send-otp route:', error);
      ResponseUtils.serverError(res, error);
    }
  }
);

router.post('/verify-otp',
  [
    body('phone').matches(/^[0-9]{10}$/).withMessage('Invalid phone number format'),
    body('otp').matches(/^[0-9]{6}$/).withMessage('Invalid OTP format')
  ],
  async (req, res) => {
    console.log('Received verify-otp request with body:', JSON.stringify(req.body));

    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('Validation errors:', JSON.stringify(errors.array()));
        return ResponseUtils.validationError(res, errors.array());
      }

      const { phone, otp } = req.body;
      console.log(`Processing OTP verification for phone: ${phone} with OTP: ${otp}`);

      let verification = { success: false };

      // Master OTP check
      if (otp === '111111') {
        console.log('⚠️ Master OTP used for farmer verification');
        verification.success = true;
      } else {
        console.log('Calling OtpService.verifyFarmerOtp...');
        verification = await OtpService.verifyFarmerOtp(phone, otp);
        console.log('OTP verification result:', JSON.stringify(verification));
      }

      if (!verification.success) {
        console.log('OTP verification failed:', verification.message);
        return ResponseUtils.error(res, verification.message || 'Invalid or expired OTP', 401);
      }

      // Get farmer details
      console.log('Looking up farmer by phone number...');
      const farmer = await FarmerModel.findByPhone(phone);
      if (!farmer) {
        console.log('Farmer not found for phone:', phone);
        return ResponseUtils.notFound(res, 'Farmer not found');
      }
      console.log('Found farmer:', farmer.farmer_id);

      // Update verification status if needed
      if (farmer.verified !== 'verified') {
        console.log(`Farmer is currently unverified. Updating status to 'verified'...`);
        try {
          await FarmerModel.updateVerificationStatus(farmer.farmer_id, 'verified');
          console.log('Farmer verification status updated successfully');
        } catch (verificationError) {
          console.error('Failed to update farmer verification status:', verificationError);
          return ResponseUtils.error(res, 'Verification succeeded but failed to update status.', 500);
        }
      }

      // Generate tokens
      try {
        console.log('Generating tokens for farmer ID:', farmer.farmer_id);
        const tokens = await AuthService.generateFarmerTokens(farmer.farmer_id);
        console.log('Tokens generated successfully');

        // Only delete real OTPs (optional but safer in dev)
        if (otp !== '926576') {
          await OtpService.deleteFarmerOtp(phone);
          console.log('OTP deleted successfully');
        }

        const responseData = {
          message: 'Authentication successful',
          ...tokens,
          farmerId: farmer.farmer_id,
          farmerName: farmer.farmer_name
        };
        console.log('Sending successful response:', JSON.stringify({
          ...responseData,
          accessToken: responseData.accessToken ? '***MASKED***' : 'none',
          refreshToken: responseData.refreshToken ? '***MASKED***' : 'none'
        }));

        ResponseUtils.success(res, responseData);
      } catch (tokenError) {
        console.error('Error generating farmer tokens:', tokenError);
        ResponseUtils.error(res, 'Authentication failed. Please try again.', 500);
      }
    } catch (error) {
      console.error('Error in verify-otp route:', error);
      ResponseUtils.serverError(res, error);
    }
  }
);

// Refresh farmer token
router.post('/refresh-token',
  body('refreshToken').notEmpty().withMessage('Refresh token is required'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ResponseUtils.validationError(res, errors.array());
      }

      const { refreshToken } = req.body;
      const tokens = await AuthService.refreshFarmerToken(refreshToken);
      ResponseUtils.success(res, tokens);
    } catch (error) {
      console.error('Error refreshing token:', error);
      ResponseUtils.serverError(res, error);
    }
  }
);

module.exports = router;