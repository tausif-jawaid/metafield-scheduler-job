const Excel = require('exceljs');
const readline = require("node:readline");
const fs = require("fs");

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
        if (!found) arr.push({ header: key1, key: key1,width: 15 });
        
      } catch (error) {
        console.log(error)
      }
    }
    newArr.push(obj)

    //console.log(arr)
    //console.log(newArr)
    //console.log(obj)

    worksheet.columns = arr;
    for (let val of newArr) {
      worksheet.addRow(val);
    }
    await workbook.xlsx.writeFile('export.xlsx');

  } catch (error) {
    throw error;
  }
}

readFile('data.jsonl');