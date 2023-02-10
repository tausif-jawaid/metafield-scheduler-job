const fs = require("fs");
const axios = require("axios");
const { readCsv } = require('../helpers/readXlxs');
const { Importlogger,Exportlogger } = require('../helpers/logger')
require('dotenv').config();
const { Parser } = require('json2csv');

const token = process.env.ACCESS_TOKEN;
const filePath = './meta_info.xlsx';



// const getMetafield = async (req, res) => {
//     const product_id = req.params.id;
//     axios({
//         url: "https://apna-star-store.myshopify.com/admin/api/2022-10/products/" + product_id + "/metafields.json",
//         method: "get",
//         headers: {
//             "Content-Type": "application/graphql",
//             "X-Shopify-Access-Token": token,
//             "Accept-Encoding": "gzip,deflate,compress"
//         }
//     }).then(response => {
//         res.status(200).json(response.data);
//     }).catch((err) => {
//         res.status(500).json({ message: err });
//     });
// }

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
    // const data = readCsv(filePath);
    const data = req.body;
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
                url: "https://apna-star-store.myshopify.com/admin/api/2023-01/products/" + item.id + "/metafields.json",
                method: "post",
                headers: {
                    "Content-Type": "application/json",
                    "X-Shopify-Access-Token": token,
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



const iddata = [];
const getMetafield = async (req, res) => {
    
    axios({
        url: "https://apna-star-store.myshopify.com/admin/api/2022-04/products.json",
        method: "get",
        headers: {
            "Content-Type": "application/graphql",
            "X-Shopify-Access-Token": token,
            "Accept-Encoding": "gzip,deflate,compress"
        }
    }).then(response => {
        const data2 = response.data.products;
         //console.log(data2)
        data2.forEach(element => {
            iddata.push(element.id);
        });
        fun(iddata);
    }).catch((err) => {
        //console.log('erro1')
        //res.status(500).json({ message: err });
    });
};



const fun = (dtaaid) => {
    let count = 0;
    var time = 1000;

    dtaaid.map(item => {
        setTimeout(() => {
            axios({
                url: "https://apna-star-store.myshopify.com/admin/api/2022-10/products/" + item + "/metafields.json",
                method: "get",
                headers: {
                    "Content-Type": "application/graphql",
                    "X-Shopify-Access-Token": token,
                    "Accept-Encoding": "gzip,deflate,compress"
                }

            }).then(response => {
                const arr = response.data.metafields;
                //console.log(arr);
                if (arr.length !== 0) {
                    const newArr = Array.prototype.concat(...arr);
                    //console.log(newArr);

                    Exportlogger.log({
                        level: 'info',
                        message: `Successs, with product : ${newArr.id}`
                    });

                    const json2csvParser = new Parser();
                    const csv = json2csvParser.parse(newArr);

                    fs.writeFile('metafields.csv', csv, function (err) {
                        if (err) throw err;
                        console.log('file export');
                    });
                }

            }).catch((err) => {
                //res.status(500).json({ message: err });
                Exportlogger.log({
                    level: 'info',
                    message: `Failure, with error: ${err}, Id:${item}`
                });
                console.log("error.........");

            });

        }, time * count);
        count++;
    })
    return response.data
}




module.exports = {
    countMetafields,
    getMetafield,
    createMetafields,
    getMeta
};