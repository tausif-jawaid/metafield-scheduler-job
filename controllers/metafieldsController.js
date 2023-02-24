const fs = require("fs");
const axios = require("axios");
const { readCsv } = require('../helpers/readXlxs');
const { Importlogger, Exportlogger } = require('../helpers/logger')
require('dotenv').config();
const { Parser } = require('json2csv');
const {jsonTocsv} = require('../helpers/jsonTocsv')
var jsonlines = require('jsonlines');
const { response } = require("express");


const token = process.env.ACCESS_TOKEN;
const filePath = './meta_info.xlsx';

const getMetafield = async (req, res) => {
    var data = `mutation {
        bulkOperationRunQuery(
         query: """
          {
            products {
              edges {
                node {
                id
                metafields {
                    edges {
                        node {
                            value
                            namespace
                            id
                            key
                            }
                        }
                    }
                }
              }
            }
          }
          """
        ) {
          bulkOperation {
            id
            status
          }
          userErrors {
            field
            message
          }
        }
      }`;
    //console.log(data)
    var config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://apna-star-store.myshopify.com/admin/api/2023-01/graphql.json',
        headers: {
            'X-Shopify-Access-Token': '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',
            'Content-Type': 'application/graphql',
            'Accept-Encoding': 'gzip,deflate,compress'
        },
        maxRedirects: 0,
        data: data
    };

    const users = async () => {
        const response = await axios(config)
        return response.data.data.bulkOperationRunQuery.bulkOperation.id
    }
    users().then(response => buildURL(response)).catch(function (error) {
        console.log('Error ist API:' + error.message);
    });

}

const buildURL = async (id) => {
    console.log(id);
    const data = `query {
        node(id: "gid://shopify/BulkOperation/1697205551240") {
          ... on BulkOperation {
            url
            partialDataUrl
          }
        }
      }`;
    console.log(data)
    var config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://apna-star-store.myshopify.com/admin/api/2021-10/graphql.json',
        headers: {
            'X-Shopify-Access-Token': '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',
            'Content-Type': 'application/graphql',
            'Accept-Encoding': 'gzip,deflate,compress'
        },
        data: data
    };


    const users = async () => {
        const response = await axios(config)
        return response.data.data.node.url
    }
    users().then(response => exportData(response)).catch(function (error) {
        console.log("Error in second API :" + error.message);
    });

}

const exportData = async (url) => {
        console.log(url)
    var config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: url,
        headers: {},
        maxRedirects: 0
    };


    const users = async () => {
        const response = await axios(config)
        return response.data
    }
    users().then(response => 
        
        //console.log(response)

        jsonTocsv(response)
        
        ).catch(function (error) {
        console.log(error);
    });


}

const countMetafields = async (req, res) => {
    product_id = req.params.id;
    axios({
        url: "https://apna-star-store.myshopify.com/admin/api/2022-10/products/" + product_id + "/metafields/count.json",
        method: "post",
        headers: {
            "Content-Type": "application/graphql",
            "X-Shopify-Access-Token": token,
            "Accept-Encoding": "gzip,deflate,compress"
        },
    }).then(response => {
        res.status(200).json(response.data);
    }).catch((err) => {
        res.status(500).json({ message: err });
    });
};

// create new metafields for specific product
const createMetafields = async (req, res) => {
     const data = readCsv(filePath);
    //const data = req.body;
    const logs = {};
    let fail = 0;
    let success = 0;
    let count = 0;
    var time = 1000;
    console.log(data)
    console.log(data.length)
    data.map(item => {

        let data = {
            metafield: {
                name: item.name,
                namespace: item.namespace,
                key: item.key,
                value: item.value,
                type: item.type,
                owner_type: "Product",
            }
        }
        setTimeout(() => {
            axios({
                url: "https://metafieldexport.myshopify.com/admin/api/2023-01/products/" + item.id + "/metafields.json",
                method: "post",
                headers: {
                    "Content-Type": "application/json",
                    "X-Shopify-Access-Token": "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",
                    "Accept-Encoding": "gzip,deflate,compress"
                },
                data: JSON.stringify(data)
            }).then(response => {
                success++;
                console.log(`count in success ${success}`)
                Importlogger.log({
                    level: 'info',
                    message: `Successs, With Product Id: ${item.id}`
                });
            }).catch((err) => {
                fail++;
                console.log(`count in failure ${fail}, ${err}`)
                Importlogger.log({
                    level: 'info',
                    message: `Failure, with error: ${err}, Id:${item.id}`
                });
            });
        }, time * count);
        count++;

    })
    //console.log((logs));
    res.status(200).json({ message: 'Data Succesfully Imported,' });

};


const getMeta = async (req, res) => {

    const myCars = [
        {
            "car": "Audi",
            "price": 40000,
            "color": "blue"
        }, {
            "car": "BMW",
            "price": 35000,
            "color": "black"
        }, {
            "car": "Porsche",
            "price": 60000,
            "color": "green"
        }
    ];

    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(myCars);

    console.log(csv);
    fs.writeFile('cars.csv', csv, function (err) {
        if (err) throw err;
        console.log('cars file saved');
    });
}


module.exports = {
    countMetafields,
    getMetafield,
    createMetafields,
    getMeta
};