

const axios = require('axios');
const https = require('https');
const fs = require("fs");
const readline = require('node:readline');
const Excel = require('exceljs');

function genarateMutationQuery() {

  const data = `mutation {
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
    return response.data.data.bulkOperationRunQuery.bulkOperation.id
  }
  users().then(response => genarateURL(response))

}

function genarateURL(arg) {
  console.log(arg)

  const data = `query {
        node(id: "gid://shopify/BulkOperation/1698776973448") {
          ... on BulkOperation {
            url
            partialDataUrl
          }
        }
      }
      `;
  console.log(data)
  const config = {
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
  users().then(response => getAllData(response))

  //console.log(response.data.data.node.url)

}

function getAllData(url) {

  https.get(url, (res) => {
    // Image will be stored at this path
    const path = "data.jsonl";
    const filePath = fs.createWriteStream(path);
    res.pipe(filePath);
    filePath.on('finish', () => {
      filePath.close();

      //console.log('Download Completed');
      readFile(`${__dirname}\\data.jsonl`)
      //console.log(`${__dirname}\\data.jsonl`)
    })
  })

}

const readFile = async (path) => {
  const fileStream = fs.createReadStream(path);
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity, });
  // Note: we use the crlfDelay option to recognize all instances of CR LF   
  // ('\r\n') in input.txt as a single line break.     
  const workbook = new Excel.Workbook();
  const worksheet = workbook.addWorksheet("My Sheet");
  worksheet.columns = [{ header: 'Id', key: 'id', width: 10 },
  { header: 'Value', key: 'value', width: 32 },
  { header: 'Namespace', key: 'namespace', width: 15, },
  { header: 'Key', key: 'key', width: 15, }];
  for await (const line of rl) {
    //console.log(`Line from file: ${line}`);
    worksheet.addRow(JSON.parse(line));
  }
  await workbook.xlsx.writeFile('export.xlsx');
}


genarateMutationQuery()

//console.log('last line')