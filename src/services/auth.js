const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { TokenModel } = require('../models');
const { FpoModel, FarmerModel } = require('../models');
const { db } = require('../config');
const bcrypt = require('bcryptjs');

class AuthService {
  constructor() {
    this.JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-keep-it-secret";
    this.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "your-refresh-secret-keep-it-secret-too";
    this.JWT_EXPIRES_IN = '1h';
    this.JWT_REFRESH_EXPIRES_IN = '7d';
  }

  async generateAuthToken(user) {
    try {
      console.log("Generating auth tokens for:", user);
      const payload = {
        phone: user.phone,
        role: user.role || 'fpo'
      };

      // Generate access token
      const accessToken = jwt.sign(payload, this.JWT_SECRET, { expiresIn: this.JWT_EXPIRES_IN });
      
      // Generate refresh token
      const refreshToken = jwt.sign(payload, this.JWT_REFRESH_SECRET, { expiresIn: this.JWT_REFRESH_EXPIRES_IN });
      
    
      
      console.log("Generated tokens. Saving to database...");
      
      // Clear existing token if any
      await db.pool.execute('DELETE FROM auth_tokens WHERE phone = ?', [user.phone]);
      
      // Store new tokens
      await db.pool.execute(
        'INSERT INTO auth_tokens (phone, auth_token, refresh_token, expires_at) VALUES (?, ?, ?, ?)',
        [user.phone, accessToken, refreshToken, expiresAt]
      );
      
      console.log("Tokens saved successfully.");
      
      return {
        accessToken,
        refreshToken,
        expiresAt
      };
    } catch (error) {
      console.error("Error generating auth tokens:", error);
      throw error;
    }
  }

  async verifyToken(token) {
    try {
      // First verify token signature
      const decoded = jwt.verify(token, this.JWT_SECRET);
      
      // Then check if token is in database and not expired
      const [rows] = await db.pool.execute(
        'SELECT * FROM auth_tokens WHERE phone = ? AND auth_token = ? AND expires_at > NOW()',
        [decoded.phone, token]
      );

      if (rows.length === 0) {
        throw new Error('Token not found or expired');
      }

      return decoded;
    } catch (error) {
      console.error("Token verification failed:", error.message);
      throw error;
    }
  }

  async refreshToken(refreshToken) {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, this.JWT_REFRESH_SECRET);
      
      // Check if refresh token exists in database
      const [rows] = await db.pool.execute(
        'SELECT * FROM auth_tokens WHERE phone = ? AND refresh_token = ?',
        [decoded.phone, refreshToken]
      );
      
      if (rows.length === 0) {
        throw new Error('Invalid refresh token');
      }
      
      // Generate new access token
      const payload = {
        phone: decoded.phone,
        role: decoded.role || 'fpo'
      };
      
      const accessToken = jwt.sign(payload, this.JWT_SECRET, { expiresIn: this.JWT_EXPIRES_IN });
      
      // Update access token in database
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 1);
      
      await db.pool.execute(
        'UPDATE auth_tokens SET auth_token = ?, expires_at = ? WHERE phone = ?',
        [accessToken, expiresAt, decoded.phone]
      );
      
      return {
        accessToken,
        expiresAt
      };
    } catch (error) {
      console.error("Token refresh failed:", error);
      throw error;
    }
  }

  async invalidateToken(phone) {
    try {
      await db.pool.execute('DELETE FROM auth_tokens WHERE phone = ?', [phone]);
      return true;
    } catch (error) {
      console.error("Error invalidating token:", error);
      throw error;
    }
  }

  static async generateFpoTokens(phone) {
    try {
      return await TokenModel.generateTokens(phone);
    } catch (error) {
      console.error("Error generating FPO tokens:", error);
      throw new Error("Failed to generate tokens");
    }
  }

  static async refreshFpoTokens(refreshToken) {
    try {
      return await TokenModel.refreshTokens(refreshToken);
    } catch (error) {
      console.error("Error refreshing FPO tokens:", error);
      throw new Error("Failed to refresh tokens");
    }
  }

  static async logoutFpo(phone) {
    try {
      await TokenModel.deleteTokens(phone);
      return { success: true, message: "Logged out successfully" };
    } catch (error) {
      console.error("Error during FPO logout:", error);
      throw new Error("Failed to logout");
    }
  }

  static async generateFarmerTokens(farmerId) {
    try {
      // Generate unique tokens
      const accessToken = crypto.randomBytes(32).toString('hex');
      const refreshToken = crypto.randomBytes(32).toString('hex');

      console.log(`Generating tokens for farmer ${farmerId}`);
      console.log(`Access token: ${accessToken.substring(0, 10)}...`);
      console.log(`Refresh token: ${refreshToken.substring(0, 10)}...`);

      // Store session in database
      await TokenModel.createFarmerSession(farmerId, accessToken, refreshToken);
      
      console.log("Tokens generated and stored successfully");
      return { 
        accessToken, 
        refreshToken, 
        farmerId 
      };
    } catch (error) {
      console.error("Error generating farmer tokens:", error);
      throw new Error("Failed to generate farmer tokens");
    }
  }

  static async verifyFarmerToken(accessToken) {
    try {
      console.log(`Verifying token: ${accessToken.substring(0, 10)}...`);
      const session = await TokenModel.verifyFarmerAccessToken(accessToken);
      if (!session) {
        console.log('Token verification failed - no session found');
        throw new Error("Invalid or expired token");
      }
      console.log('Token verified successfully');
      return session;
    } catch (error) {
      console.error("Error verifying farmer token:", error);
      throw error;
    }
  }

  static async refreshFarmerToken(refreshToken) {
    try {
      console.log(`Refreshing token: ${refreshToken.substring(0, 10)}...`);
      const session = await TokenModel.verifyFarmerRefreshToken(refreshToken);
      if (!session) {
        console.log('Refresh token verification failed - no session found');
        throw new Error("Invalid or expired refresh token");
      }

      // Generate new access token
      const newAccessToken = crypto.randomBytes(32).toString('hex');
      await TokenModel.updateFarmerAccessToken(session.farmer_id, newAccessToken);
      
      console.log('Token refreshed successfully');
      return { 
        accessToken: newAccessToken,
        refreshToken: session.refresh_token,
        farmerId: session.farmer_id
      };
    } catch (error) {
      console.error("Error refreshing farmer token:", error);
      throw error;
    }
  }

  static async verifyFpoCredentials(phone, password) {
    try {
      const [rows] = await FpoModel.findByPhoneAndPassword(phone, password);
      if (rows.length === 0) {
        return { success: false, message: "Invalid credentials" };
      }
      return { success: true, fpo: rows[0] };
    } catch (error) {
      console.error("Error verifying FPO credentials:", error);
      throw new Error("Failed to verify credentials");
    }
  }
}

module.exports = AuthService;