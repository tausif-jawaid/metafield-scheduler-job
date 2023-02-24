const axios = require("axios");
const https = require("https");
const fs = require("fs");
const fsPromise = require("fs/promises")
const readline = require("node:readline");
const Excel = require("exceljs");
require('dotenv').config();
const { Exportlogger } = require('../helpers/logger')

const token = process.env.ACCESS_TOKEN;
const store_name = process.env.STORE_NAME;

function delay(time) {
    return new Promise(resolve =>
        setTimeout(resolve, time)
    );
}

const restCall = async (data) => {
    try {
        const url = `${store_name}/admin/api/2021-10/graphql.json`;
        const headers = {
            "X-Shopify-Access-Token": token,
            "Content-Type": "application/graphql",
            "Accept-Encoding": "gzip,deflate,compress",
        };
        return axios.post(url, data, { headers });
        //return res;
    } catch (error) {
        throw error;
    }
};

const genarateMutationQuery = async () => {
    const query = `mutation {
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
                }userErrors {
                    field
                    message
                }
            }
         }`;
    const res = await restCall(query);
    return res.data.data.bulkOperationRunQuery.bulkOperation.id;
};

const genarateURL = async (id) => {
    //console.log(id)
    const query = `query {
        node(id: "${id}") {
             ... on BulkOperation {
                url
                 partialDataUrl
                }
             }
        } `;
    //console.log(query)
    const { data } = await restCall(query);
    return data.data.node.url;

};

const getAllData = async (url) => {
    const path = "data.jsonl";
    const { data } = await axios.get(url)
    await fsPromise.writeFile(path, data)
    readFile(path)

}

const readFile = async (path) => {
    var arr = [];
    arr.push({ header: "Product Id", key: "id", width: 15 });
    var newArr = [];
    try {
        const fileStream = fs.createReadStream(path);
        const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity, });
        const workbook = new Excel.Workbook();
        const worksheet = workbook.addWorksheet("My Sheet");

        var obj = {};
        for await (const line of rl) {
            try {
                const data = JSON.parse(line);
                var currid

                if ("id" in data) {
                    //worksheet.addRow(obj);
                    if (Object.keys(obj).length !== 0) {
                        newArr.push(obj);
                    }
                    obj = {};
                    currid = data["id"];
                    currid = currid.replace("gid://shopify/Product/", "");
                    obj["id"] = currid;
                    continue;
                }

                key1 = data.key;
                value = data.value
                obj[key1] = value;

                const found = arr.some(el => el.key === key1);
                if (!found) arr.push({ header: key1, key: key1, width: 15 });

            } catch (error) {
                console.log(error)
            }
        }
        newArr.push(obj)

        worksheet.columns = arr;
        for (let val of newArr) {
            try {
                worksheet.addRow(val);
                Exportlogger.log({
                    level: 'info',
                    message: `Successs, Id: ${val.id}`
                });

            } catch (error) {
                Exportlogger.log({
                    level: 'info',
                    message: `Failure, with error: ${error}, Id :${val.id}`
                });
            }
            //worksheet.addRow(val);
        }
        await workbook.xlsx.writeFile('export.xlsx');

    } catch (error) {
        throw error;
    }
}


// const readFile = async (path) => {

//     try {
//         const fileStream = fs.createReadStream(path);
//         const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity, });
//         const workbook = new Excel.Workbook();
//         const worksheet = workbook.addWorksheet("My Sheet");
//         worksheet.columns = [
//             { header: 'Id', key: 'id', width: 10 },
//             { header: 'Value', key: 'value', width: 32 },
//             { header: 'Namespace', key: 'namespace', width: 15, },
//             { header: 'Key', key: 'key', width: 15, }
//         ];
//         for await (const line of rl) {
//             try {
//                 worksheet.addRow(JSON.parse(line));
//                 Exportlogger.log({
//                     level: 'info',
//                     message: `Successs, Data: ${line}`
//                 });

//             } catch (error) {
//                 Exportlogger.log({
//                     level: 'info',
//                     message: `Failure, with error: ${error}, Data :${line}`
//                 });
//             }

//         }
//         await workbook.xlsx.writeFile('export.xlsx');

//     } catch (error) {
//         throw error;
//     }    
// }

const execute = async () => {
    const id = await genarateMutationQuery();
    await delay(3000)
    const url = await genarateURL(id);
    const path = await getAllData(url);
    //const data = await readFile(path)
};

module.exports = {
    execute
}

//execute().then(res => console.log(res));