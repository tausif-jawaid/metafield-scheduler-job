const fs = require("fs");
const axios = require("axios");
require("dotenv").config();
const { readCsv } = require("../helpers/readXlxs");
filePath = "./product_info.xlsx";

const token = process.env.ACCESS_TOKEN;
//get all workouts

const getProduct = async (req, res) => {
  try {
    const resp = await axios.get(
      "https://apna-star-store.myshopify.com/admin/api/2022-04/products.json",
      {
        headers: {
          "Content-Type": "application/graphql",
          "X-Shopify-Access-Token": token,
          "Accept-Encoding": "gzip,deflate,compress",
        },
      }
    );
    res.status(200).json(resp.data);
  } catch (err) {
    // Handle Error Here
    res.status(500).json({ message: err });
  }
};

// create new metafields for specific product
const createProducts = async (req, res) => {
  // const data = readCsv(filePath);
  const data = req.body;
  const logs = {};
  let count = 1;
  let fail = 0;
  let success = 0;
  var time = 1000;
  console.log(data.length);
  //console.log(data)

  data.map((item) => {
    let data = {
      product: {
        title: item.title,
        body_html: item.body_html,
        vendor: item.vendor,
        handle: item.handle,
        product_type: item.product_type,
        variants: [
          {
            sku: item.sku,
            title: item.sku_title,
          },
        ],
      },
    };

    // console.log(data);
    setTimeout(() => {
      axios({
        url: "https://apna-star-store.myshopify.com/admin/api/2023-01/products.json",
        method: "post",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": token,
          "Accept-Encoding": "gzip,deflate,compress",
        },
        data: JSON.stringify(data),
      })
        .then((response) => {
          success++;
          console.log(`count in success ${success}`);
          logs["dataResponse" + count] = response.data;
        })
        .catch((err) => {
          fail++;
          console.log(`count in failure ${fail}, ${err}`);
          logs["errorAt" + count] = err.data;
        });
    }, time * count);
    count++;
  });

  //console.log((logs));
  //res.status(200).json(data);
  res.status(200).json({ message: "Data Succesfully Imported" });
};

// For add Single Product in shopify API

// const createProducts = async (req, res) => {
//   const data = {
//     product: {
//       title: 'Burton Custom Freestyle',
//       body_html: '<strong>Good snowboard!</strong>',
//       vendor: 'Burton',
//       handle: 'burton-custom-freestyle',
//       product_type: 'Snowboard',
//     }
//   }

//   axios({
//     url: "https://apna-star-store.myshopify.com/admin/api/2023-01/products.json",
//     method: "post",
//     headers: {
//       "Content-Type": "application/json",
//       "X-Shopify-Access-Token": token,
//       "Accept-Encoding": "gzip,deflate,compress"
//     },
//     data: JSON.stringify(data)
//   }).then(response => {
//     res.status(200).json(response.data);
//   }).catch((err) => {
//     res.status(500).json({ message: err });
//   });
// };

module.exports = {
  getProduct,
  createProducts,
};
