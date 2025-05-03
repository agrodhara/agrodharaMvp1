const { db } = require('../config');
const FarmerModel = require('../models/farmer');

const FarmerController = {
  async getFarmerById(farmerId) {
    try {
      const farmer = await FarmerModel.getById(farmerId);
      return farmer;
    } catch (error) {
      console.error("Error getting farmer:", error);
      throw error;
    }
  },

  async updateFarmer(farmerId, data) {
    try {
      await FarmerModel.update(farmerId, data);
      return await FarmerModel.getById(farmerId);
    } catch (error) {
      console.error("Error updating farmer:", error);
      throw error;
    }
  },

  async deleteFarmer(farmerId) {
    try {
      await FarmerModel.delete(farmerId);
    } catch (error) {
      console.error("Error deleting farmer:", error);
      throw error;
    }
  }
};

module.exports = FarmerController; 