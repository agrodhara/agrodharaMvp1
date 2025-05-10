const db = require('../config/database');

const CropModel = {
  // Get all crop varieties
  async getCropVarieties() {
    try {
      const [rows] = await db.pool.execute('SELECT * FROM crop_varieties');
      return rows;
    } catch (error) {
      console.error('Error fetching crop varieties:', error);
      throw error;
    }
  },

  // Get sub varieties by crop_variety_id
  async getSubVarietiesByCropId(cropVarietyId) {
    try {
      const [rows] = await db.pool.execute(
        'SELECT * FROM sub_varieties WHERE crop_variety_id = ?',
        [cropVarietyId]
      );
      return rows;
    } catch (error) {
      console.error('Error fetching sub varieties:', error);
      throw error;
    }
  },

  // ✅ New: Get all sub varieties
  async getAllSubVarieties() {
    try {
      const [rows] = await db.pool.execute('SELECT * FROM sub_varieties');
      return rows;
    } catch (error) {
      console.error('Error fetching all sub varieties:', error);
      throw error;
    }
  },

  // Get all grades
  async getGrades() {
    try {
      const [rows] = await db.pool.execute('SELECT * FROM grades');
      return rows;
    } catch (error) {
      console.error('Error fetching grades:', error);
      throw error;
    }
  },

  // Get all farming types
  async getFarmingTypes() {
    try {
      const [rows] = await db.pool.execute('SELECT * FROM farming_types');
      return rows;
    } catch (error) {
      console.error('Error fetching farming types:', error);
      throw error;
    }
  }
};

module.exports = CropModel;
