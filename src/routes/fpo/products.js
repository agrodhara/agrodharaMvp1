const express = require('express');
const router = express.Router();
const { auth, validation } = require('../../middleware');
const { ProductModel } = require('../../models');

const { ResponseUtils } = require('../../utils');

// Get all products for FPO by ID
router.get('/:fpoId',
  auth.authenticateToken,
  async (req, res) => {
    try {
      const fpoId = req.params.fpoId;
      if (!fpoId) {
        return ResponseUtils.error(res, 'FPO ID is required', 400);
      }
      const products = await ProductModel.findByFpoId(fpoId);
      ResponseUtils.success(res, products);
    } catch (error) {
      console.error('Error fetching products:', error);
      ResponseUtils.serverError(res, error);
    }
  }
);

// Create new product listing (no authentication required)
router.post('/',
  auth.authenticateToken,
  validation.productValidator,
  validation.validate,
  async (req, res) => {
    try {
      const productData = {
        ...req.body,
        fpo_id: req.body.fpo_id
      };

      // Check for duplicate
      const isDuplicate = await ProductModel.checkDuplicate(productData);
      if (isDuplicate) {
        return ResponseUtils.error(res, 'Product with same details already exists', 409);
      }

      const productId = await ProductModel.create(productData);
      ResponseUtils.success(res, { id: productId }, 'Product listing created successfully', 201);
    } catch (error) {
      console.error('Error creating product:', error);
      ResponseUtils.serverError(res, error);
    }
  }
);

module.exports = router;