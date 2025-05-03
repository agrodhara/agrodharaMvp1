const { db } = require('../config');

const ProductModel = {
  async create(productData) {
    const [result] = await db.pool.execute(
      `INSERT INTO productlistings 
       (fpo_id, product, variety, quantity, grade, cost_per_quantity, note, total, portal_charges_checked)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        productData.fpo_id, productData.product, productData.variety, productData.quantity,
        productData.grade, productData.cost_per_quantity, productData.note, productData.total,
        productData.portal_charges_checked || false
      ]
    );
    return result.insertId;
  },

  async findByFpoId(fpoId) {
    const [rows] = await db.pool.execute(
      'SELECT * FROM productlistings WHERE fpo_id = ?',
      [fpoId]
    );
    return rows;
  },

  async checkDuplicate(productData) {
    const [rows] = await db.pool.execute(
      `SELECT * FROM productlistings 
       WHERE fpo_id = ? AND product = ? AND variety = ? AND grade = ?`,
      [productData.fpo_id, productData.product, productData.variety, productData.grade]
    );
    return rows.length > 0;
  }
};

module.exports = ProductModel;