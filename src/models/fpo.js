const { db } = require('../config');
const bcrypt = require('bcryptjs');

const FpoModel = {
  async create(fpoData) {
    console.log("Creating FPO with data:", { ...fpoData, password: '[REDACTED]' });
    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(fpoData.password, 10);
    
    try {
      const [result] = await db.pool.execute(
        `INSERT INTO fpo_details 
         (phone, fpo_name, legal_structure, incorporation_date, password, registration_number,
          state, district, villages_covered, contact_name, designation, alternate_contact)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          fpoData.phone, fpoData.fpo_name, fpoData.legal_structure, fpoData.incorporation_date,
          hashedPassword, fpoData.registration_number, fpoData.state, fpoData.district,
          fpoData.villages_covered, fpoData.contact_name, fpoData.designation, fpoData.alternate_contact
        ]
      );
      console.log("FPO created successfully with ID:", result.insertId);
      return result.insertId;
    } catch (error) {
      console.error("Error creating FPO:", error);
      throw error;
    }
  },

  async updateById(id, fpoData) {
  
  
    try {
      const [result] = await db.pool.execute(
        `UPDATE fpo_details SET
          fpo_name = ?, 
          legal_structure = ?, 
          incorporation_date = ?, 
           
          registration_number = ?, 
          state = ?, 
          district = ?, 
          villages_covered = ?, 
          board_member_name = ?, 
          ceo_name = ?
        WHERE id = ?`,
        [
          fpoData.fpo_name,
          fpoData.legal_structure,
          fpoData.incorporation_date,
          
          fpoData.registration_number,
          fpoData.state,
          fpoData.district,
          fpoData.villages_covered,
          fpoData.board_member_name,
          fpoData.ceo_name,
          id
        ]
      );
  
      console.log("FPO updated successfully by ID, affected rows:", result.affectedRows);
      return result.affectedRows;
    } catch (error) {
      console.error("Error updating FPO by ID:", error);
      throw error;
    }
  },

  async findByPhone(phone) {
    try {
      const [rows] = await db.pool.execute(
        'SELECT * FROM fpo_details WHERE phone = ?',
        [phone]
      );
      return rows[0];
    } catch (error) {
      console.error("Error finding FPO by phone:", error);
      throw error;
    }
  },


  async findByid(id) {
    try {
      const [rows] = await db.pool.execute(
        'SELECT * FROM fpo_details WHERE id = ?',
        [id]
      );
      return rows[0];
    } catch (error) {
      console.error("Error finding FPO by id:", error);
      throw error;
    }
  },


  async checkRegistrationNumberExists(registrationNumber, excludePhone = null) {
    try {
      let query = 'SELECT phone FROM fpo_details WHERE registration_number = ?';
      const params = [registrationNumber];

      if (excludePhone) {
        query += ' AND phone != ?';
        params.push(excludePhone);
      }

      const [rows] = await db.pool.execute(query, params);
      return rows.length > 0;
    } catch (error) {
      console.error("Error checking registration number:", error);
      throw error;
    }
  }
};

module.exports = FpoModel;