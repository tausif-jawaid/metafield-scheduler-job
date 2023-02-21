const { Parser } = require('json2csv');
const fs = require("fs");

const jsonTocsv = (Data) => {

    const data  = [
        {id: 1, name: 'Tausif', dob: new Date(1970, 1, 1)},
        {id: 1, name: 'Sameer', dob: new Date(1970, 1, 1)},
        {id: 1, name: 'Adil', dob: new Date(1970, 1, 1)},
        {id: 1, name: 'Ankit', dob: new Date(1970, 1, 1)}
    ]

    //const ParseData = JSON.parse(Data);   
    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(data,{
        headers: 'key'
    });

    //console.log(csv);
    fs.writeFile('metafields.csv', csv, function (err) {
    if (err) throw err;
    //console.log('Data Exported');
    });
}

module.exports = {
    jsonTocsv
}



