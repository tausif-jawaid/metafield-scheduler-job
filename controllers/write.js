const Excel = require('exceljs');

async function exTest(){
  const workbook = new Excel.Workbook();
  const worksheet = workbook.addWorksheet("My Sheet");

worksheet.columns = [
 {header: 'Id', key: 'id', width: 10},
 {header: 'Name', key: 'name', width: 32}, 
 {header: 'D.O.B.', key: 'dob', width: 15,}
];

const data  = [
    {id: 1, name: 'Tausif', dob: new Date(1970, 1, 1)},
    {id: 1, name: 'Sameer', dob: new Date(1970, 1, 1)},
    {id: 1, name: 'Adil', dob: new Date(1970, 1, 1)},
    {id: 1, name: 'Ankit', dob: new Date(1970, 1, 1)}
]

// for (let val of data){
//     worksheet.addRow(val);
// }   

worksheet.addRow(data);
// save under export.xlsx
await workbook.xlsx.writeFile('export.xlsx');
console.log("File is written");

};

exTest();