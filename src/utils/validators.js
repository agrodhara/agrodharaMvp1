const { body, validationResult } = require('express-validator');

class ValidatorUtils {
  static fpoProfileValidator() {
    return [
      body('fpo_name').notEmpty().trim().withMessage('FPO name is required'),
      body('legal_structure').isIn(['Cooperative', 'Company', 'Society', 'Other'])
        .withMessage('Invalid legal structure'),
      body('incorporation_date').isDate().withMessage('Invalid incorporation date'),
      body('password').notEmpty().isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),
      body('registration_number').notEmpty().trim()
        .withMessage('Registration number is required'),
      body('state').notEmpty().trim().withMessage('State is required'),
      body('district').notEmpty().trim().withMessage('District is required'),
      body('contact_name').notEmpty().trim().withMessage('Contact name is required'),
      body('designation').notEmpty().trim().withMessage('Designation is required'),
      body('alternate_contact').optional().matches(/^[0-9]{10}$/)
        .withMessage('Invalid alternate contact format')
    ];
  }

  static farmerValidator() {
    return [
      body('name').notEmpty().withMessage('Name is required'),
      body('phone').matches(/^[0-9]{10}$/).withMessage('Invalid phone number format'),
      body('address').notEmpty().withMessage('Address is required'),
      body('total_plot_size').isDecimal().withMessage('Total plot size must be a decimal'),
      body('crop_plot_size').isDecimal().withMessage('Crop plot size must be a decimal'),
      body('impact_duration').optional().isInt(),
      body('harvester_charges').optional().isDecimal()
    ];
  }

  static productValidator() {
    return [
      body('product').notEmpty().withMessage('Product name is required'),
      body('quantity').isDecimal().withMessage('Quantity must be a decimal'),
      body('cost_per_quantity').isDecimal().withMessage('Cost must be a decimal'),
      body('grade').optional().isString(),
      body('variety').optional().isString()
    ];
  }

  static validate(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }

  static phoneValidator(field = 'phone') {
    return body(field).matches(/^[0-9]{10}$/).withMessage('Invalid phone number format');
  }

  static otpValidator() {
    return [
      body('phone').matches(/^[0-9]{10}$/).withMessage('Invalid phone number format'),
      body('otp').matches(/^[0-9]{6}$/).withMessage('Invalid OTP format')
    ];
  }
}

module.exports = ValidatorUtils;