const { db } = require('../config');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const TokenModel = {
  async generateTokens(phone) {
    const accessToken = jwt.sign({ phone }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "5m" });
    const refreshToken = jwt.sign({ phone }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "15m" });

    // Calculate expiration times
    const accessTokenExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
    const refreshTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

    await db.pool.execute(
        'INSERT INTO auth_tokens (phone, auth_token, refresh_token, expires_at) ' +
        'VALUES (?, ?, ?, ?) ' +
        'ON DUPLICATE KEY UPDATE auth_token = ?, refresh_token = ?, expires_at = ?',
        [phone, accessToken, refreshToken, refreshTokenExpiresAt, accessToken, refreshToken, refreshTokenExpiresAt]
    );

    return { accessToken, refreshToken };
},

async refreshTokens(refreshToken) {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    
    const [rows] = await db.pool.execute(
        'SELECT * FROM auth_tokens WHERE phone = ? AND refresh_token = ? AND expires_at > NOW()',
        [decoded.phone, refreshToken]
    );

    if (rows.length === 0) {
        throw new Error('Invalid or expired refresh token');
    }

    const newAccessToken = jwt.sign({ phone: decoded.phone }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "5m" });
    const newRefreshToken = jwt.sign({ phone: decoded.phone }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "15m" });

    // Calculate new expiration times
    const newAccessTokenExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
    const newRefreshTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

    await db.pool.execute(
        'UPDATE auth_tokens SET auth_token = ?, refresh_token = ?, expires_at = ? WHERE phone = ?',
        [newAccessToken, newRefreshToken, newRefreshTokenExpiresAt, decoded.phone]
    );

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
},

  async deleteTokens(phone) {
    await db.pool.execute(
      'DELETE FROM auth_tokens WHERE phone = ?',
      [phone]
    );
  },

  // Farmer token methods
  async createFarmerSession(farmerId, accessToken, refreshToken) {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // Set expiration to 24 hours

    try {
      // First delete any existing sessions for this farmer
      await db.pool.execute(
        'DELETE FROM farmer_sessions2 WHERE farmer_id = ?',
        [farmerId]
      );

      // Create new session
      await db.pool.execute(
        'INSERT INTO farmer_sessions2 (farmer_id, access_token, refresh_token, expires_at) ' +
        'VALUES (?, ?, ?, ?)',
        [farmerId, accessToken, refreshToken, expiresAt]
      );
      console.log(`Created new session for farmer ${farmerId}`);
    } catch (error) {
      console.error('Error creating farmer session:', error);
      throw error;
    }
  },

  async verifyFarmerRefreshToken(refreshToken) {
    try {
      const [rows] = await db.pool.execute(
        'SELECT * FROM farmer_sessions2 WHERE refresh_token = ? AND expires_at > NOW()',
        [refreshToken]
      );
      return rows[0];
    } catch (error) {
      console.error('Error verifying refresh token:', error);
      throw error;
    }
  },

  async verifyFarmerAccessToken(accessToken) {
    try {
      const [ rows] = await db.pool.execute(
        'SELECT * FROM farmer_sessions2 WHERE access_token = ? AND expires_at > NOW()',
        [accessToken]
      );
      return rows[0];
    } catch (error) {
      console.error('Error verifying access token:', error);
      throw error;
    }
  },

  async updateFarmerAccessToken(farmerId, newAccessToken) {
    try {
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // Set expiration to 24 hours

      await db.pool.execute(
        'UPDATE farmer_sessions2 SET access_token = ?, expires_at = ? WHERE farmer_id = ?',
        [newAccessToken, expiresAt, farmerId]
      );
      console.log(`Updated access token for farmer ${farmerId}`);
      return true;
    } catch (error) {
      console.error('Error updating farmer access token:', error);
      throw error;
    }
  }
};

module.exports = TokenModel;