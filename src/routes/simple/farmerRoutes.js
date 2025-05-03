const express = require('express');
const router = express.Router();
const db = require('../../config/database').pool;

// POST endpoint to insert farmer data into farmers2 table
router.post('/farmers', async (req, res) => {
  const {
    fpo_id,
    farmer_name,
    contact_number,
    village_name,
    district_name,
    state_name,
    years_in_farming,
    years_in_growing_crop,
    total_plot_size,
    total_plot_unit,
    crop_plot_size,
    crop_plot_unit,
    soil_type,
    soil_testing_done,
    open_to_soil_testing,
    current_yield,
    crop_variety,
    crop_sub_variety,
    farming_type,
    last_year_yield,
    last_year_quantity_sold,
    last_year_selling_price,
    sowing_date,
    harvest_date,
    prone_to_calamities,
    calamity_type,
    impact_duration_days,
    impact_severity,
    production_cost_per_unit,
    production_cost_unit,
    max_expense_category,
    uses_combine_harvesters,
    harvester_charges_per_quintal,
    willing_to_adopt_sustainable_farming,
    participates_in_govt_schemes,
    preferred_payment_method,
  } = req.body;

  const sql = `INSERT INTO farmers2 (
    fpo_id, farmer_name, contact_number, village_name, district_name, state_name,
    years_in_farming, years_in_growing_crop, total_plot_size, total_plot_unit,
    crop_plot_size, crop_plot_unit, soil_type, soil_testing_done, open_to_soil_testing,
    current_yield, crop_variety, crop_sub_variety, farming_type, last_year_yield,
    last_year_quantity_sold, last_year_selling_price, sowing_date, harvest_date,
    prone_to_calamities, calamity_type, impact_duration_days, impact_severity,
    production_cost_per_unit, production_cost_unit, max_expense_category,
    uses_combine_harvesters, harvester_charges_per_quintal,
    willing_to_adopt_sustainable_farming, participates_in_govt_schemes, preferred_payment_method
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const values = [
    fpo_id,
    farmer_name,
    contact_number,
    village_name,
    district_name,
    state_name,
    years_in_farming,
    years_in_growing_crop,
    total_plot_size,
    total_plot_unit,
    crop_plot_size,
    crop_plot_unit,
    soil_type,
    soil_testing_done,
    open_to_soil_testing,
    current_yield,
    crop_variety,
    crop_sub_variety,
    farming_type,
    last_year_yield,
    last_year_quantity_sold,
    last_year_selling_price,
    sowing_date,
    harvest_date,
    prone_to_calamities,
    calamity_type,
    impact_duration_days,
    impact_severity,
    production_cost_per_unit,
    production_cost_unit,
    max_expense_category,
    uses_combine_harvesters,
    harvester_charges_per_quintal,
    willing_to_adopt_sustainable_farming,
    participates_in_govt_schemes,
    preferred_payment_method,
  ];

  try {
    const [result] = await db.query(sql, values);
    res.status(201).json({ message: 'Farmer data inserted successfully', farmerId: result.insertId });
  } catch (error) {
    console.error('Error inserting data:', error);
    res.status(500).json({ error: 'Database insertion failed' });
  }
});

module.exports = router; 