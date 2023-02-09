require('dotenv').config();
const express = require('express');
const metafieldsRoutes = require('./routes/metafields')
const productsRouts = require('./routes/products');
//const mongoose = require('mongoose');

const port = process.env.PORT || 8000;
 
const fs = require('fs');
const cors = require('cors')

// express app
const app = express();
app.use(express.json())
app.use(cors())
app.use(express.urlencoded({extended: true}));
app.use((req,res,next) => {
    console.log(req.path,req.method)
    next()
})

app.use('/api/shopify/metafields',metafieldsRoutes);
app.use('/api/shopify/products',productsRouts)

const server = app.listen(port, () =>{
    console.log(' Server is listening on port',port)
})



