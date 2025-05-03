const express = require('express');
const router = express.Router();
const fpoAuthRouter = require('./fpoAuth');
const farmerAuthRouter = require('./farmerAuth');

router.use('/fpo', fpoAuthRouter);
router.use('/farmer', farmerAuthRouter);

module.exports = router;