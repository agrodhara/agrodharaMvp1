const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { auth, validation, rateLimiter } = require('../../middleware');
const { OtpService, AuthService } = require('../../services');
const { FpoModel } = require('../../models');
const { ResponseUtils, TokenUtils } = require('../../utils');
const {db} = require('../../config');
const bcrypt = require('bcryptjs');


// Check if phone number exists
router.get('/check-phone/:phone',
  async (req, res, next) => {
    try {
      const { phone } = req.params;
      
      if (!phone || phone.length !== 10) {
        return ResponseUtils.badRequest(res, 'Valid phone number is required');
      }
      
      // Check if phone exists in database
      const fpo = await FpoModel.findByPhone(phone);
      
      return ResponseUtils.success(res, {
        exists: !!fpo,
        registered: !!fpo
      });
    } catch (error) {
      console.error('Error checking phone:', error);
      next(error);
    }
  }
);

// Check if phone number is registered (public route)
router.get('/check-user-exists/:phone',
  async (req, res, next) => {
    try {
      const { phone } = req.params;
      
      console.log("=== Check User Exists ===");
      console.log("Phone to check:", phone);
      
      if (!phone || phone.length !== 10) {
        return ResponseUtils.badRequest(res, 'Valid phone number is required');
      }
      
      // Check if phone exists in database
      const fpo = await FpoModel.findByPhone(phone);
      console.log(`User exists check result: ${!!fpo}`);
      
      return ResponseUtils.success(res, {
        exists: !!fpo,
        registered: !!fpo
      });
    } catch (error) {
      console.error('Error checking if user exists:', error);
      next(error);
    }
  }
);

// Direct register - no verification or token needed
router.post('/direct-register',
  [
    body('phone').matches(/^[0-9]{10}$/).withMessage('Invalid phone number format'),
    body('fpo_name').notEmpty().trim().withMessage('FPO name is required'),
    body('whatsapp_enabled').notEmpty().trim().withMessage('whatsapp enabled is required'),
    body('legal_structure').isIn(['Cooperative', 'Company', 'Society', 'Other']).withMessage('Invalid legal structure'),
    body('incorporation_date').isDate().withMessage('Invalid incorporation date'),
    body('password').notEmpty().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('registration_number').notEmpty().trim().withMessage('Registration number is required'),
    body('state').notEmpty().trim().withMessage('State is required'),
    body('district').notEmpty().trim().withMessage('District is required'),
    body('ceo_name').notEmpty().trim().withMessage('ceo_name is required'),
    body('board_member_name').notEmpty().trim().withMessage('board_member_name is required'),
    body('alternate_contact').optional().matches(/^[0-9]{10}$/).withMessage('Invalid alternate contact format')
  ],
  validation.validate,
  async (req, res, next) => {
    try {
      console.log("=== Direct FPO Registration ===");
      console.log("Request body:", { ...req.body, password: '[REDACTED]' });
      
      const { 
        phone, fpo_name, email,legal_structure, incorporation_date, password, 
        registration_number, state, district, villages_covered, 
        board_member_name, ceo_name,  alternate_contact,whatsapp_enabled 
      } = req.body;
      
      // Check if phone already exists
      const existingFpo = await FpoModel.findByPhone(phone);
      if (existingFpo) {
        return ResponseUtils.error(res, 'Phone number already registered', 409);
      }
      
      // Check if registration number already exists
      const regExists = await FpoModel.checkRegistrationNumberExists(registration_number);
      if (regExists) {
        return ResponseUtils.error(res, 'Registration number already exists', 409);
      }
     
      const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

      try {
        // Create new FPO profile
        console.log("Creating new FPO profile without verification");
        
        // Insert into database
        const [result] = await db.pool.execute(
          `INSERT INTO fpo_details 
           (phone, fpo_name, legal_structure, incorporation_date, password, registration_number,
            state, district, villages_covered, board_member_name, ceo_name, alternate_contact,whatsapp_enabled,email)
           VALUES (?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)`,
          [phone, fpo_name, legal_structure, incorporation_date, hashedPassword, registration_number,
           state, district, villages_covered, board_member_name, ceo_name, alternate_contact,whatsapp_enabled,email]
        );
        
        console.log("FPO profile created successfully. ID:", result.insertId);
        
        ResponseUtils.success(res, {
          id: result.insertId,
          phone,
          fpo_name,
          message: 'FPO profile created successfully'
        }, 'Registration successful', 201);
      } catch (dbError) {
        console.error("Database error:", dbError);
        if (dbError.code === 'ER_DUP_ENTRY') {
          return ResponseUtils.error(res, 'Phone number or registration number already exists', 409);
        }
        throw dbError;
      }
    } catch (error) {
      console.error("Error in direct registration:", error);
      next(error);
    }
  }
);









// msg 91 work












// Send OTP
router.post(
  '/send-otp',
  body('phone').matches(/^[0-9]{10}$/).withMessage('Invalid phone number format'),
  validation.validate,
  async (req, res, next) => {
    try {
      console.log("🚀 /send-otp hit");

      const { phone } = req.body;
      console.log("📲 Phone received:", phone);

      const otp = await OtpService.generateOtp();
      console.log("🔢 OTP generated:", otp);

      const result = await OtpService.sendOtp(phone, otp);
      console.log("📤 Result from OtpService.sendOtp:", result);

      ResponseUtils.success(res, {}, 'OTP sent successfully');
    } catch (error) {
      console.error("❌ Error in /send-otp:", error);
      next(error);
    }
  }
);


router.post('/verify-otp',
  [
    body('phone').matches(/^[0-9]{10}$/).withMessage('Invalid phone number format'),
    body('otp').matches(/^[0-9]{6}$/).withMessage('Invalid OTP format')
  ],
  validation.validate,
  async (req, res, next) => {
    try {
      const { phone, otp } = req.body;

      // Allow master OTP
      if (otp === '926576') {
        console.log('⚠️ Master OTP used');

        const tokens = await AuthService.generateFpoTokens(phone);
        const fpo = await FpoModel.findByPhone(phone);

        return ResponseUtils.success(res, {
          ...tokens,
          isNewUser: !fpo,
          fpoDetails: fpo || null
        });
      }

      // Normal OTP verification
      const verification = await OtpService.verifyOtp(phone, otp);
      if (!verification.success) {
        return ResponseUtils.error(res, verification.message, 401);
      }

      const tokens = await AuthService.generateFpoTokens(phone);
      const fpo = await FpoModel.findByPhone(phone);

      ResponseUtils.success(res, {
        ...tokens,
        isNewUser: !fpo,
        fpoDetails: fpo || null
      });
    } catch (error) {
      next(error);
    }
  }
);

// Simple OTP verification (no tokens generated)
// This is a public route and does not require authentication
router.post('/simple-verify-otp',
  [
    body('phone').matches(/^[0-9]{10}$/).withMessage('Invalid phone number format'),
    body('otp').matches(/^[0-9]{6}$/).withMessage('Invalid OTP format')
  ],
  validation.validate,
  async (req, res, next) => {
    try {
      console.log("=== Simple OTP Verification ===");
      console.log("Request body:", { phone: req.body.phone, otp: '******' });
      
      const { phone, otp } = req.body;
      
      const verification = await OtpService.verifyOtp(phone, otp);
      if (!verification.success) {
        console.log(`OTP verification failed for phone: ${phone}`);
        return ResponseUtils.error(res, verification.message, 401);
      }

      // Check if user already exists
      const fpo = await FpoModel.findByPhone(phone);
      console.log(`User exists check for ${phone}: ${!!fpo}`);

      // Return success without generating tokens
      return ResponseUtils.success(res, {
        verified: true,
        userExists: !!fpo,
        message: 'OTP verified successfully'
      });
    } catch (error) {
      console.error('Error verifying OTP (simple):', error);
      next(error);
    }
  }
);
router.post('/login',
  [
    body('phone').matches(/^[0-9]{10}$/).withMessage('Invalid phone number format'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  validation.validate,
  async (req, res, next) => {
    try {
      const { phone, password } = req.body;
      const fpo = await FpoModel.findByPhone(phone);

      if (!fpo) {
        return ResponseUtils.notFound(res, 'Account not found. Please register first.');
      }

      const isMatch = await bcrypt.compare(password, fpo.password);
      if (!isMatch) {
        return ResponseUtils.unauthorized(res, 'Incorrect password');
      }

      const tokens = await AuthService.generateFpoTokens(phone);
      ResponseUtils.success(res, {
        ...tokens,
        fpoDetails: fpo
      });
    } catch (error) {
      next(error);
    }
  }
);

// Refresh token
router.post('/refresh-token',
  body('refreshToken').notEmpty().withMessage('Refresh token is required'),
  validation.validate,
  async (req, res, next) => {
    try {
      const { refreshToken } = req.body;
      const tokens = await AuthService.refreshFpoTokens(refreshToken);
      const decoded = TokenUtils.decodeToken(tokens.accessToken);
      const fpo = await FpoModel.findByPhone(decoded.phone);

      ResponseUtils.success(res, {
        ...tokens,
        user: fpo
      });
    } catch (error) {
      next(error);
    }
  }
);

// Logout
router.post('/logout',
  auth.authenticateToken,
  async (req, res, next) => {
    try {
      await AuthService.logoutFpo(req.user.phone);
      ResponseUtils.success(res, {}, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  }
);

router.post('/basic-verify-otp', async (req, res) => {
  try {
    console.log("=== Basic OTP Verification (No Auth) ===");
    const { phone, otp } = req.body;
    
    console.log("Phone:", phone, "OTP: *****");

    if (!phone || !otp) {
      return res.status(400).json({ 
        success: false,
        message: 'Phone and OTP required' 
      });
    }

    let verification = { success: false };

    // Allow master OTP
    if (otp === '926576') {
      console.log("⚠️ Master OTP used for basic verification");
      verification.success = true;
    } else {
      verification = await OtpService.verifyOtp(phone, otp);
    }

    // Check if user exists (optional)
    const fpo = await FpoModel.findByPhone(phone);

    return res.json({ 
      success: true, 
      verified: verification.success,
      userExists: !!fpo,
      message: verification.success ? 'OTP verified successfully' : 'Invalid OTP'
    });
  } catch (error) {
    console.error("Error in basic OTP verification:", error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error during verification'
    });
  }
});








// Forgot password - update password using phone number


router.post('/forgotpassword', async (req, res) => {
  const { phone, newPassword } = req.body;

  if (!phone || !newPassword) {
    return res.status(400).json({ success: false, message: 'Phone and new password are required' });
  }

  try {
    const connection = await db.pool.getConnection();

    try {
      // Check if the user exists
      const [users] = await connection.query('SELECT * FROM fpo_details WHERE phone = ?', [phone]);

      if (users.length === 0) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      // 🔐 Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // ✅ Update the hashed password
      await connection.query('UPDATE fpo_details SET password = ? WHERE phone = ?', [hashedPassword, phone]);

      res.status(200).json({ success: true, message: 'Password updated successfully' });
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});




module.exports = router;