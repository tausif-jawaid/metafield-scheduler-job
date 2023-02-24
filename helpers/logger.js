const winston = require('winston');


    var  filename="Import_logger_file_" + new Date().toJSON().slice(0,10) + ".log" ;
    const Importlogger = winston.createLogger({
      transports: [
         new winston.transports.Console(),
        new winston.transports.File({ filename: filename})
      ]
    });


    var  filename="Export_logger_file_" + new Date().toJSON().slice(0,10) + ".log" ;
    const Exportlogger = winston.createLogger({
      transports: [
         //new winston.transports.Console(),
        new winston.transports.File({ filename: filename})
      ]
    });

module.exports = {
    Exportlogger,
    Importlogger
}