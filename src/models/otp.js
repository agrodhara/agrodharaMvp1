const { db } = require('../config');
const https = require('https');

const OtpModel = {
  async createOrUpdate(phone, otp) {
    await db.pool.execute(
      'INSERT INTO otp_store (phone, otp_code, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 5 MINUTE)) ' +
      'ON DUPLICATE KEY UPDATE otp_code = ?, expires_at = DATE_ADD(NOW(), INTERVAL 5 MINUTE)',
      [phone, otp, otp]
    );
  },

  async verify(phone, otp) {
    const [rows] = await db.pool.execute(
      'SELECT * FROM otp_store WHERE phone = ? AND otp_code = ? AND expires_at > NOW()',
      [phone, otp]
    );
    return rows.length > 0;
  },


  
  async delete(phone) {
    await db.pool.execute(
      'DELETE FROM otp_store WHERE phone = ?',
      [phone]
    );
  },

  // Farmer OTP methods
  async createOrUpdateFarmerOtp(phone, otp) {
    try {
      // First delete any existing OTP for this phone
      await db.pool.execute(
        'DELETE FROM farmer_otp_store WHERE phone = ?',
        [phone]
      );
      
      // Then insert a new OTP without using ON DUPLICATE KEY
      await db.pool.execute(
        'INSERT INTO farmer_otp_store (phone, otp_code, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 5 MINUTE))',
        [phone, otp]
      );
    } catch (error) {
      // If foreign key constraint fails, it means the phone number doesn't exist
      // in the referenced table. As a temporary workaround, store the OTP in memory
      console.error("Database error storing farmer OTP:", error.message);
      console.log("Using temporary OTP storage for this session");
      
      // Store temporary OTP in a global variable (this will be lost on server restart)
      if (!global.tempOtpStore) global.tempOtpStore = {};
      global.tempOtpStore[phone] = {
        otp,
        expires: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes from now
      };
    }
  },

  async verifyFarmerOtp(phone, otp) {
    console.log(`OTP Model: Verifying OTP for phone ${phone}`);
    
    try {
      // First try to verify from database
      console.log(`OTP Model: Checking database for OTP...`);
      const [rows] = await db.pool.execute(
        'SELECT * FROM farmer_otp_store WHERE phone = ? AND otp_code = ? AND expires_at > NOW()',
        [phone, otp]
      );
      
      console.log(`OTP Model: Database check result - ${rows.length} matching rows found`);
      
      if (rows.length > 0) {
        console.log(`OTP Model: Valid OTP found in database`);
        return true;
      }
      
      // If not found in database, check temporary storage
      console.log(`OTP Model: Checking in-memory storage...`);
      if (global.tempOtpStore && global.tempOtpStore[phone]) {
        const tempOtp = global.tempOtpStore[phone];
        console.log(`OTP Model: Found in-memory OTP. Saved OTP: ${tempOtp.otp}, Expires: ${tempOtp.expires}, Now: ${new Date()}`);
        
        if (tempOtp.otp === otp && tempOtp.expires > new Date()) {
          console.log(`OTP Model: Valid OTP found in memory`);
          return true;
        } else {
          console.log(`OTP Model: In-memory OTP is invalid or expired`);
        }
      } else {
        console.log(`OTP Model: No in-memory OTP found for this phone`);
      }
      
      console.log(`OTP Model: OTP verification failed - no valid OTP found`);
      return false;
    } catch (error) {
      console.error("OTP Model: Error verifying farmer OTP:", error);
      
      // Check temporary storage as fallback
      if (global.tempOtpStore && global.tempOtpStore[phone]) {
        const tempOtp = global.tempOtpStore[phone];
        console.log(`OTP Model: Database error, using in-memory fallback. Saved OTP: ${tempOtp.otp}, Provided OTP: ${otp}`);
        
        if (tempOtp.otp === otp && tempOtp.expires > new Date()) {
          console.log(`OTP Model: Valid OTP found in memory (fallback)`);
          return true;
        }
      }
      
      console.log(`OTP Model: OTP verification failed due to error`);
      return false;
    }
  },
  
  async deleteFarmerOtp(phone) {
    try {
      // Try to delete from database
      await db.pool.execute(
        'DELETE FROM farmer_otp_store WHERE phone = ?',
        [phone]
      );
    } catch (error) {
      console.error("Error deleting farmer OTP:", error);
    }
    
    // Also delete from temporary storage if exists
    if (global.tempOtpStore && global.tempOtpStore[phone]) {
      delete global.tempOtpStore[phone];
    }
  }
};

module.exports = OtpModel;