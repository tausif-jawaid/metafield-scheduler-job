const axios = require("axios");
const https = require("https");
const fs = require("fs");
const fsPromise = require("fs/promises")
const readline = require("node:readline");
const Excel = require("exceljs");
require('dotenv').config();

const token = process.env.ACCESS_TOKEN;

function delay(time) {
    return new Promise(resolve =>
        setTimeout(resolve, time)
    );
}

const restCall = async (data) => {
    try {
        const url = "https://apna-star-store.myshopify.com/admin/api/2021-10/graphql.json";
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
    const fileStream = fs.createReadStream(path);
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity, });
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet("My Sheet");
    worksheet.columns = [
        { header: 'Id', key: 'id', width: 10 },
        { header: 'Value', key: 'value', width: 32 },
        { header: 'Namespace', key: 'namespace', width: 15, },
        { header: 'Key', key: 'key', width: 15, }
    ];
    for await (const line of rl) {
        worksheet.addRow(JSON.parse(line));
    }
    await workbook.xlsx.writeFile('export.xlsx');
}

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