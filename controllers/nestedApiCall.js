

const axios = require('axios');

async function sayHello() {

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
    let response = await axios(config)
    console.log(response.data.data.bulkOperationRunQuery.bulkOperation.id)
    sayHi(response.data.data.bulkOperationRunQuery.bulkOperation.id)
    //console.log('inside sayHello function')
}

async function sayHi(arg){
    //console.log('inside sayHi function')
    console.log(arg)

    const data = `query {
        node(id: "${arg}") {
          ... on BulkOperation {
            url
            partialDataUrl
          }
        }
      }
      `;

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
    let response = await axios(config)
    console.log(response.data.data.node.url)
    getAllData(response.data.data.node.url)

}

async function getAllData(url){
    //console.log('inside sayHi function')
    console.log(url)
    const config = {
        method: 'get',
        url: url,
    };
    let response = await axios(config)
    console.log(response.data)
    

}


sayHello()

//console.log('last line')