const rateLimit = require('express-rate-limit');

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each phone to 5 requests per windowMs
  message: "Too many OTP requests, please try again later",
  keyGenerator: (req) => {
    return req.body.phone; // limit by phone number
  }
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests, please try again later"
});

module.exports = {
  otpLimiter,
  apiLimiter
};