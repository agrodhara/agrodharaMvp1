const { body, validationResult } = require('express-validator');





// Product validation
const productValidator = [
  body('fpo_id').notEmpty().withMessage('FPO ID is required'),
  body('product').notEmpty().trim().withMessage('Product name is required'),
  body('variety').optional().trim(),
  body('quantity').isFloat({ min: 0 }).withMessage('Quantity must be a positive number'),
  body('grade').optional().trim(),
  body('cost_per_quantity').isFloat({ min: 0 }).withMessage('Cost per quantity must be a positive number'),
  body('note').optional().trim(),
  body('total').isFloat({ min: 0 }).withMessage('Total must be a positive number'),
  body('portal_charges_checked').isBoolean().withMessage('Portal charges checked must be a boolean')
];

// FPO profile validation
const fpoProfileValidation = [
  body('fpo_name').notEmpty().trim().withMessage('FPO name is required'),
  body('legal_structure').isIn(['Cooperative', 'Company', 'Society', 'Other']).withMessage('Invalid legal structure'),
  body('incorporation_date').isDate().withMessage('Invalid incorporation date'),
  body('password').notEmpty().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('registration_number').notEmpty().trim().withMessage('Registration number is required'),
  body('state').notEmpty().trim().withMessage('State is required'),
  body('district').notEmpty().trim().withMessage('District is required'),
  body('contact_name').notEmpty().trim().withMessage('Contact name is required'),
  body('designation').notEmpty().trim().withMessage('Designation is required'),
  body('alternate_contact').optional().matches(/^[0-9]{10}$/).withMessage('Invalid alternate contact format')
];

// Farmer validation
const farmerValidation = [
  body('fpo_id').notEmpty().withMessage('FPO ID is required'),
  body('farmer_name').notEmpty().trim().withMessage('Farmer name is required'),
  body('contact_number').matches(/^[0-9]{10}$/).withMessage('Invalid phone number format'),
  body('village_name').notEmpty().trim().withMessage('Village is required'),
 
  body('total_plot_size').isFloat({ min: 0 }).withMessage('Total plot size must be a positive number'),
  
  body('impact_duration').optional().isInt({ min: 0 }).withMessage('Impact duration must be a positive integer'),
  body('years_in_farming').optional().isIn(['1-5', '6-10', '11-20', '20+']).withMessage('Invalid years in farming value'),
  body('years_in_crop').optional().isIn(['1-5', '6-10', '11-20', '20+']).withMessage('Invalid years in crop value')
];

// OTP validation 
const otpValidation = [
  body('phone').matches(/^[0-9]{10}$/).withMessage('Invalid phone number format'),
  body('otp').matches(/^[0-9]{6}$/).withMessage('Invalid OTP format')
];

// Phone validation
const phoneValidation = [
  body('phone').matches(/^[0-9]{10}$/).withMessage('Invalid phone number format')
];

// Weather notification validation
const weatherNotificationValidation = [
  body('district').notEmpty().withMessage('District is required'),
  body('alert_type').isIn(['heat', 'cold', 'rain', 'storm']).withMessage('Invalid alert type'),
  body('severity').isIn(['low', 'medium', 'high']).withMessage('Invalid severity'),
  body('message').notEmpty().withMessage('Message is required'),
  body('start_date').isISO8601().withMessage('Invalid start date format'),
  body('end_date').isISO8601().withMessage('Invalid end date format')
];

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = {
  productValidator,
  fpoProfileValidation,
  farmerValidation,
  otpValidation,
  phoneValidation,
  weatherNotificationValidation,
  validate
};