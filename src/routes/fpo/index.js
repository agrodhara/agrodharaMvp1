const express = require('express');
const router = express.Router();
const profileRouter = require('./profile');
const farmersRouter = require('./farmers');
const productsRouter = require('./products');
const factsRouter = require('./Facts');
const contactUsRouter = require('./ContactUs');

router.use('/profile', profileRouter);
router.use('/farmers', farmersRouter);
router.use('/products', productsRouter);
router.use('/facts', factsRouter);
router.use('/contact', contactUsRouter);

module.exports = router;