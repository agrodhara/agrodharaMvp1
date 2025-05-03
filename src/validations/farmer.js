const { body } = require('express-validator');

const farmerValidation = [
  // Basic information
  body('name').notEmpty().trim().withMessage('Farmer name is required'),
  body('phone').matches(/^[0-9]{10}$/).withMessage('Invalid phone number format'),
  body('village').notEmpty().trim().withMessage('Village is required'),
  body('district').optional().trim(),
  body('state').optional().trim(),
  
  // Farm details
  body('years_in_farming').optional().isIn(['1-5', '6-10', '11-20', '20+']).withMessage('Invalid years in farming value'),
  body('years_in_crop').optional().isIn(['1-5', '6-10', '11-20', '20+']).withMessage('Invalid years in crop value'),
  body('total_plot_size').isFloat({ min: 0 }).withMessage('Total plot size must be a positive number'),
  
  
  body('soil_testing').optional().isIn(['Yes', 'No']).withMessage('Invalid soil testing value'),
  body('open_to_soil_testing').optional().isIn(['Yes', 'No']).withMessage('Invalid value for open to soil testing'),
  
  
  body('prone_to_natural_calamities').optional().isIn(['Yes', 'No']).withMessage('Invalid value for prone to calamities'),
  body('calamity_type').optional(),
  body('impact_duration').optional().isInt({ min: 0 }).withMessage('Impact duration must be a positive integer'),
  body('impact_severity').optional(),
  
  //
  // Additional information
  body('sustainable_practices').optional().isIn(['Yes', 'No']).withMessage('Invalid value for sustainable practices'),
  body('government_schemes').optional().isIn(['Yes', 'No']).withMessage('Invalid value for government schemes'),
  body('preferred_payment_method').optional().isIn(['Cash', 'Bank Transfer', 'Digital Wallets']).withMessage('Invalid payment method'),
  body('aware_of_gi_benefits').optional().isIn(['Yes', 'No']).withMessage('Invalid value for aware of GI benefits')
];

module.exports = {
  farmerValidation
}; 