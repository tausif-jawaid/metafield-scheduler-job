const express = require('express');
const {getMetafield,countMetafields, createMetafields} = require('../controllers/metafieldsController')
const router = express.Router();

// get single specific product metafields
router.get('/getmetafield/:id',getMetafield)

// count specific product metafields
router.get('/count/:id',countMetafields);


// create specific product metafields
router.post('/', createMetafields)

router.get('/',getMetafield)

module.exports = router