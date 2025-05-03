const jwt = require('jsonwebtoken');
const crypto = require('crypto');

class TokenUtils {
  static generateAccessToken(payload, expiresIn = '1h') {
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn });
  }

  static generateRefreshToken(payload, expiresIn = '7d') {
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn });
  }

  static generateFarmerAccessToken(farmerId, expiresIn = '1h') {
    return jwt.sign(
      { farmerId },
      process.env.FARMER_ACCESS_TOKEN_SECRET || "your_secret_key",
      { expiresIn }
    );
  }

  static generateRandomToken(length = 64) {
    return crypto.randomBytes(length).toString('hex');
  }

  static verifyAccessToken(token) {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  }

  static verifyRefreshToken(token) {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
  }

  static verifyFarmerToken(token) {
    return jwt.verify(
      token,
      process.env.FARMER_ACCESS_TOKEN_SECRET || "your_secret_key"
    );
  }

  static decodeToken(token) {
    return jwt.decode(token);
  }
}

module.exports = TokenUtils;