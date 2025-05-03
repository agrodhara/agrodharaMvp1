const express = require('express');
const router = express.Router();
const { auth, validation } = require('../../middleware');
const { body } = require('express-validator');
const { FpoModel } = require('../../models');
const { ResponseUtils } = require('../../utils');
const { validationResult } = require('express-validator');
const { db } = require('../../config');

// Get FPO profile
router.get('/',
  auth.authenticateToken,
  async (req, res) => {
    try {
      const fpo = await FpoModel.findByPhone(req.user.phone);
      if (!fpo) {
        return ResponseUtils.notFound(res, 'FPO profile not found');
      }
      ResponseUtils.success(res, fpo);
    } catch (error) {
      ResponseUtils.serverError(res, error);
    }
  }
);





router.get('/:id', 
  auth.authenticateToken,
  async (req, res) => {
  const fpoid = req.params.id;
  try {
    const fpoDetails = await FpoModel.findByid(fpoid); // Call your `findByid` function
    if (!fpoDetails) {
      return res.status(404).json({ message: 'FPO not found' });
    }
    res.json(fpoDetails);
  } catch (error) {
    console.error('Error fetching FPO details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});






router.put('/update/:id', auth.authenticateToken, async (req, res) => {
  const fpoId = req.params.id;
  const fpoData = req.body;

  try {
    const affectedRows = await FpoModel.updateById(fpoId, fpoData);

    if (affectedRows === 0) {
      return res.status(404).json({ message: 'FPO not found or no changes made.' });
    }

    res.status(200).json({ message: 'FPO updated successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update FPO.', error: error.message });
  }
});









// Create/Update FPO profile
router.post('/',
  auth.authenticateToken,
  [
    body('fpo_name').notEmpty().trim(),
    body('legal_structure').isIn(['Cooperative', 'Company', 'Society', 'Other']),
    body('incorporation_date').isDate(),
    body('password').notEmpty().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('registration_number').notEmpty().trim(),
    body('state').notEmpty().trim(),
    body('district').notEmpty().trim(),
    body('contact_name').notEmpty().trim(),
    body('designation').notEmpty().trim(),
    body('alternate_contact').optional().matches(/^[0-9]{10}$/).withMessage('Invalid alternate contact format')
  ],
  async (req, res) => {
    try {
      console.log("=== FPO Profile API Request ===");
      console.log("Request body:", req.body);
      console.log("Authenticated user:", req.user);
      console.log("Headers:", req.headers);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log("Validation errors:", errors.array());
        return res.status(400).json({ errors: errors.array() });
      }

      const { fpo_name, legal_structure, incorporation_date, password, registration_number, 
              state, district, villages_covered, contact_name, designation, alternate_contact, phone } = req.body;

      // Use phone from request body or from authenticated user
      const fpoPhone = phone || req.user.phone;
      console.log("Using phone number for profile:", fpoPhone);

      try {
        // Check if registration number already exists with a different phone number
        console.log("Checking for duplicate registration number:", registration_number);
        const [regCheck] = await db.pool.execute(
          'SELECT phone FROM fpo_details WHERE registration_number = ? AND phone != ?',
          [registration_number, fpoPhone]
        );

        if (regCheck.length > 0) {
          console.log("Registration number already in use:", registration_number);
          return res.status(400).json({ error: "Registration number already exists" });
        }

        // Check if this is a new registration or update
        console.log("Checking for existing FPO with phone:", fpoPhone);
        const [existingFpo] = await db.pool.execute(
          'SELECT phone FROM fpo_details WHERE phone = ?',
          [fpoPhone]
        );

        console.log("Existing FPO check result:", existingFpo);

        if (existingFpo.length === 0) {
          console.log("Creating new FPO profile");
          console.log("SQL parameters:", [
            fpoPhone, fpo_name, legal_structure, incorporation_date, password,
            registration_number, state, district, villages_covered,
            contact_name, designation, alternate_contact
          ]);

          // New registration
          const [result] = await db.pool.execute(
            `INSERT INTO fpo_details 
             (phone, fpo_name, legal_structure, incorporation_date, password, 
              registration_number, state, district, villages_covered, 
              contact_name, designation, alternate_contact) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [fpoPhone, fpo_name, legal_structure, incorporation_date, password,
             registration_number, state, district, villages_covered,
             contact_name, designation, alternate_contact]
          );
          console.log("New FPO profile created successfully. Insert ID:", result.insertId);
          return res.status(201).json({ 
            success: true, 
            message: "FPO profile created successfully",
            id: result.insertId 
          });
        } else {
          console.log("Updating existing FPO profile");
          // Update existing profile
          const [result] = await db.pool.execute(
            `UPDATE fpo_details SET
             fpo_name = ?, legal_structure = ?, incorporation_date = ?, password = ?,
             registration_number = ?, state = ?, district = ?, villages_covered = ?,
             contact_name = ?, designation = ?, alternate_contact = ?
             WHERE phone = ?`,
            [fpo_name, legal_structure, incorporation_date, password,
             registration_number, state, district, villages_covered,
             contact_name, designation, alternate_contact, fpoPhone]
          );
          console.log("FPO profile updated successfully. Affected rows:", result.affectedRows);
          return res.json({ 
            success: true, 
            message: "FPO profile updated successfully" 
          });
        }
      } catch (dbError) {
        console.error("Database error:", dbError);
        if (dbError.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ 
            success: false, 
            error: "Registration number already exists" 
          });
        }
        throw dbError;
      }
    } catch (error) {
      console.error("Error in FPO profile route:", error);
      return res.status(500).json({ 
        success: false, 
        error: "Failed to create/update FPO profile" 
      });
    }
  }
);

// Change password
router.post('/change-password',
  auth.authenticateToken,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
  ],
  validation.validate,
  async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const phone = req.user.phone;

      // Verify current password
      const fpo = await FpoModel.findByPhone(phone);
      if (fpo.password !== currentPassword) {
        return ResponseUtils.unauthorized(res, 'Current password is incorrect');
      }

      // Update password
      await FpoModel.update(phone, { password: newPassword });
      ResponseUtils.success(res, {}, 'Password updated successfully');
    } catch (error) {
      ResponseUtils.serverError(res, error);
    }
  }
);

module.exports = router;