const express = require('express');
const router = express.Router();
const { WeatherService } = require('../services');
const { ResponseUtils } = require('../utils');
const { auth } = require('../middleware');
const { param } = require('express-validator');
const FpoModel = require('../models/fpo');


// Health check endpoint
router.get('/health', (req, res) => {
  ResponseUtils.success(res, { status: 'OK' });
});

// Weather endpoint
router.get('/weather',
  
  async (req, res) => {
    try {
      const { lat, lon } = req.query;
      const weatherData = await WeatherService.getWeatherData(lat, lon);
      ResponseUtils.success(res, weatherData);
    } catch (error) {
      ResponseUtils.serverError(res, error);
    }
  }
);

// Check user exists
router.get('/check-user-exists/:phone',
  [
    param('phone').matches(/^[0-9]{10}$/).withMessage('Invalid phone number format')
  ],
  async (req, res) => {
    try {
      const phone = req.params.phone;
      const fpo = await FpoModel.findByPhone(phone);
      ResponseUtils.success(res, { exists: !!fpo });
    } catch (error) {
      ResponseUtils.serverError(res, error);
    }
  }
);

module.exports = router;