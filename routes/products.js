const express = require('express');
const { getProduct, createProducts  } = require('../controllers/productsController');
const router = express.Router();

// Tausif comment 
// get all products
router.get('/', getProduct)
router.post('/', createProducts)

module.exports = router