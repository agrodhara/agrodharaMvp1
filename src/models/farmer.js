const db = require('../config/database');

const FarmerModel = {
  /**
  
  /**
   * Get a farmer by ID
   * @param {Object} formData - Farmer data from form
 * @returns {Promise<number>} - Created farmer ID
 */
async create(formData) {
  console.log("Safe Data:", formData);

  const safeData = Object.fromEntries(
    Object.entries(formData).map(([key, value]) => {
      if (value === undefined) return [key, null];
      if (key === "fpo_id") return [key, Number(value)];
      return [key, value];
    })
  );
  

  const [result] = await db.pool.execute(
    `INSERT INTO farmers2 
     (fpo_id, farmer_name, contact_number, village_name, house_number, gram_panchayat, district_name, state_name, 
      pincode, block, years_in_farming, years_in_growing_crop, total_plot_size, total_plot_unit, 
      soil_testing_done, open_to_soil_testing, prone_to_calamities, calamity_type, 
      impact_duration_days, impact_severity, willing_to_adopt_sustainable_farming, participates_in_govt_schemes, 
      preferred_payment_method)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      safeData.fpo_id,
      safeData.farmer_name,
      safeData.contact_number,
      safeData.village_name,
      safeData.house_number,
      safeData.gram_panchayat,
      safeData.district_name,
      safeData.state_name,
      safeData.pincode,
      safeData.block,
      safeData.years_in_farming,
      safeData.years_in_growing_crop,
      safeData.total_plot_size,
      safeData.total_plot_unit,
      safeData.soil_testing_done,
      safeData.open_to_soil_testing,
      safeData.prone_to_calamities,
      safeData.calamity_type,
      safeData.impact_duration_days,
      safeData.impact_severity,
      safeData.willing_to_adopt_sustainable_farming,
      safeData.participates_in_govt_schemes,
      safeData.preferred_payment_method
    ]
  );
  return result.insertId;
},





async getById(farmerId) {
  try {
    // 1. Get the farmer details
    const [farmerRows] = await db.pool.execute(
      'SELECT * FROM farmers2 WHERE farmer_id = ?',
      [farmerId]
    );
    const farmer = farmerRows[0];
    if (!farmer) return null;

    // 2. Get the farmer's crops
    const [cropRows] = await db.pool.execute(
      `SELECT id, crop_variety, crop_sub_variety, grade, sowing_date, farming_type, 
              harvest_date, expected_harvest_quantity, created_at 
       FROM farmer_crop_details 
       WHERE farmer_id = ?`,
      [farmerId]
    );



    

    // 3. Attach crops to farmer object
    return {
      ...farmer,
      crops: cropRows
    };
  } catch (error) {
    console.error('Error getting farmer with crop details:', error);
    throw error;
  }
},




  /**
   * Find a farmer by phone number
   * @param {string} phone - Farmer phone number
   * @returns {Promise<Object>} - Farmer data
   */
  async findByPhone(phone) {
    try {
      // Check only the farmers2 table
      const [rows] = await db.pool.execute(
        'SELECT * FROM farmers2 WHERE contact_number = ?',
        [phone]
      );
      
      return rows[0] || null;
    } catch (error) {
      console.error('Error finding farmer by phone:', error);
      throw error;
    }
  },

  async update(farmerId, farmerData) {
    const connection = await db.pool.getConnection();
    try {
      await connection.beginTransaction();
  
      await connection.execute(
        `UPDATE farmers2 SET 
          farmer_name = ?, 
          contact_number = ?, 
          village_name = ?, 
          pincode = ?, 
          district_name = ?, 
          state_name = ?, 
          block = ?, 
          gram_panchayat = ?, 
          house_number = ?, 
          years_in_farming = ?, 
          years_in_growing_crop = ?, 
          total_plot_size = ?, 
          total_plot_unit = ?, 
          soil_testing_done = ?, 
          open_to_soil_testing = ?, 
          prone_to_calamities = ?, 
          calamity_type = ?, 
          impact_duration_days = ?, 
          impact_severity = ?, 
          willing_to_adopt_sustainable_farming = ?, 
          participates_in_govt_schemes = ?, 
          preferred_payment_method = ? 
        WHERE farmer_id = ?`,
        [
          farmerData.farmer_name,
          farmerData.contact_number,
          farmerData.village_name,
          farmerData.pincode,
          farmerData.district_name,
          farmerData.state_name,
          farmerData.block,
          farmerData.gram_panchayat,
          farmerData.house_number,
          farmerData.years_in_farming,
          farmerData.years_in_growing_crop,
          farmerData.total_plot_size,
          farmerData.total_plot_unit,
          farmerData.soil_testing_done,
          farmerData.open_to_soil_testing,
          farmerData.prone_to_calamities,
          farmerData.calamity_type,
          farmerData.impact_duration_days,
          farmerData.impact_severity,
          farmerData.willing_to_adopt_sustainable_farming,
          farmerData.participates_in_govt_schemes,
          farmerData.preferred_payment_method,
          farmerId
        ]
      );
  
      // Get current crops
      const [existingCrops] = await connection.execute(
        `SELECT id FROM farmer_crop_details WHERE farmer_id = ?`,
        [farmerId]
      );
      const existingCropIds = existingCrops.map(crop => crop.id);
      const newCropIds = farmerData.crops.map(crop => crop.id).filter(id => id !== undefined);
  
      // Remove old crops
      const cropsToRemove = existingCropIds.filter(id => !newCropIds.includes(id));
      if (cropsToRemove.length > 0) {
        const placeholders = cropsToRemove.map(() => '?').join(',');
        await connection.execute(
          `DELETE FROM farmer_crop_details WHERE id IN (${placeholders})`,
          cropsToRemove
        );
      }
  
      // Add/update crops
      for (const crop of farmerData.crops) {
        if (crop.id) {
          await connection.execute(
            `UPDATE farmer_crop_details SET 
              crop_variety = ?, 
              crop_sub_variety = ?, 
              grade = ?, 
              sowing_date = ?, 
              farming_type = ?, 
              harvest_date = ?, 
              expected_harvest_quantity = ? 
            WHERE id = ?`,
            [
              crop.crop_variety,
              crop.crop_sub_variety,
              crop.grade,
              crop.sowing_date,
              crop.farming_type,
              crop.harvest_date,
              crop.expected_harvest_quantity,
              crop.id
            ]
          );
        } else {
          await connection.execute(
            `INSERT INTO farmer_crop_details (farmer_id, crop_variety, crop_sub_variety, grade, sowing_date, farming_type, harvest_date, expected_harvest_quantity, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
              farmerId,
              crop.crop_variety,
              crop.crop_sub_variety,
              crop.grade,
              crop.sowing_date,
              crop.farming_type,
              crop.harvest_date,
              crop.expected_harvest_quantity
            ]
          );
        }
      }
  
      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },
  




  /**
   * Delete a farmer
   * @param {number} id - Farmer ID
   * @returns {Promise<boolean>} - Success status
   */
  async delete(farmerId) {
    await db.pool.execute(
      'DELETE FROM farmers2 WHERE id = ?',
      [farmerId]
    );
  },



/**
 * Update verification status of a farmer
 * @param {number} farmerId - Farmer ID
 * @param {string} status - New status ('verified', etc.)
 * @returns {Promise<void>}
 */
async updateVerificationStatus(farmerId, status) {
  await db.pool.execute(
    'UPDATE farmers2 SET verification_status = ? WHERE farmer_id = ?',
    [status, farmerId]
  );
},

  /**
   * Get a farmer by ID with FPO details
   * @param {number} id - Farmer ID
   * @returns {Promise<Object>} - Farmer data with FPO details
   */
  async getByIdWithFpo(farmerId) {
    try {
      // Get farmer data with FPO details through a JOIN
      const [rows] = await db.pool.execute(
        `SELECT f.*, fpo.fpo_name, fpo.state as fpo_state, fpo.district as fpo_district 
         FROM farmers2 f
         LEFT JOIN fpo_details fpo ON f.fpo_id = fpo.id
         WHERE f.farmer_id = ?`,
        [farmerId]
      );
      
      return rows[0] || null;
    } catch (error) {
      console.error('Error getting farmer with FPO details:', error);
      throw error;
    }
  },







/**
 * Bulk insert farmers
 * @param {Array<Object>} farmers - Array of farmer data objects
 * @returns {Promise<void>}
 */
async bulkCreate(farmers) {
  if (!Array.isArray(farmers) || farmers.length === 0) return;

  const keys = [
    "fpo_id", "farmer_name", "contact_number", "village_name", "house_number", "gram_panchayat",
    "district_name", "state_name", "pincode", "block", "years_in_farming", "years_in_growing_crop",
    "total_plot_size", "total_plot_unit", "soil_testing_done", "open_to_soil_testing",
    "prone_to_calamities", "calamity_type", "impact_duration_days", "impact_severity",
    "willing_to_adopt_sustainable_farming", "participates_in_govt_schemes", "preferred_payment_method"
  ];

  const placeholders = farmers.map(() => `(${keys.map(() => '?').join(',')})`).join(',');
  const values = farmers.flatMap(farmer =>
    keys.map(key => farmer[key] !== undefined ? farmer[key] : null)
  );

  const query = `
    INSERT INTO farmers2 (${keys.join(',')})
    VALUES ${placeholders}
  `;

  await db.pool.query(query, values);
}



};

module.exports = FarmerModel;