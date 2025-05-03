const { aws } = require('../config');
const { PublishCommand } = require('@aws-sdk/client-sns');
const { OtpModel } = require('../models');
const https = require('https');


class OtpService {
  static async generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static async sendOtp(phone, otp) {
    try {
      // Store OTP in the database
      await OtpModel.createOrUpdate(phone, otp);
  
      const MSG91_AUTHKEY = '445895AYWIyVjWMz67f286fbP1';
      const TEMPLATE_ID = '67f2851cd6fc055cde046663';
      const fullPhone = `91${phone}`;
  
      const payload = JSON.stringify({ OTP: otp });
  
      const options = {
        method: 'POST',
        hostname: 'control.msg91.com',
        path: `/api/v5/otp?template_id=${TEMPLATE_ID}&mobile=${fullPhone}&authkey=${MSG91_AUTHKEY}&realTimeResponse=1`,
        headers: {
          'Content-Type': 'application/json'
        }
      };
  
      await new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
          let data = '';
  
          res.on('data', (chunk) => data += chunk);
          res.on('end', () => {
            const parsed = JSON.parse(data);
            console.log("📤 MSG91 Response:", parsed);
  
            if (parsed.type === 'success') {
              resolve();
            } else {
              reject(new Error(`MSG91 Error: ${parsed.message || 'Failed to send OTP'}`));
            }
          });
        });
  
        req.on('error', (err) => {
          console.error("❌ HTTPS request error:", err);
          reject(err);
        });
  
        req.write(payload);
        req.end();
      });
  
      return { success: true, message: "OTP sent successfully via MSG91" };
  
    } catch (error) {
      console.error("❌ Error sending OTP via MSG91:", error);
      throw new Error("Failed to send OTP via MSG91");
    }
  }

  static async verifyOtp(phone, otp) {
    try {
      const isValid = await OtpModel.verify(phone, otp);
      if (!isValid) {
        return { success: false, message: "Invalid or expired OTP" };
      }

      // Delete used OTP
      await OtpModel.delete(phone);
      return { success: true, message: "OTP verified successfully" };
    } catch (error) {
      console.error("Error verifying OTP:", error);
      throw new Error("Failed to verify OTP");
    }
  }

  static async sendFarmerOtp(phone) {
    try {
      const otp = await this.generateOtp();
      await OtpModel.createOrUpdateFarmerOtp(phone, otp);
      
      // In production, you would send the OTP via SMS
      console.log(`OTP for farmer ${phone}: ${otp}`);
      
      return { success: true, otp, message: "OTP sent successfully" }; // Returning OTP for development
    } catch (error) {
      console.error("Error sending farmer OTP:", error);
      // Don't throw, return consistent error format
      return { success: false, message: "Failed to send OTP" };
    }
  }

  static async verifyFarmerOtp(phone, otp) {
    try {
      console.log(`Verifying OTP for phone ${phone} with code ${otp}`);
      
      const isValid = await OtpModel.verifyFarmerOtp(phone, otp);
      console.log(`OTP verification result: ${isValid ? 'valid' : 'invalid'}`);
      
      if (!isValid) {
        return { success: false, message: "Invalid or expired OTP" };
      }

      // Don't delete the OTP here - will be deleted after token generation
      // to allow for retry if token generation fails
      return { success: true, message: "OTP verified successfully" };
    } catch (error) {
      console.error("Error verifying farmer OTP:", error);
      return { success: false, message: "Failed to verify OTP due to system error" };
    }
  }

  static async deleteFarmerOtp(phone) {
    try {
      await OtpModel.deleteFarmerOtp(phone);
      return { success: true, message: "OTP deleted successfully" };
    } catch (error) {
      console.error("Error deleting farmer OTP:", error);
      return { success: false, message: "Failed to delete OTP" };
    }
  }
}

module.exports = OtpService;