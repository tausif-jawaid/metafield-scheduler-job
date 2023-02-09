const winston = require('winston');
    var  filename="logger_file_" + new Date().toJSON().slice(0,10) + ".log" ;
    const logger = winston.createLogger({
      transports: [
         new winston.transports.Console(),
        new winston.transports.File({ filename: filename})
      ]
    });

module.exports = {
    logger
}