const { createLogger, format, transports } = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const { timestamp, combine, json } = format;


const transportInfo = new DailyRotateFile({
  filename: process.env.LOG_INFO_FILE_PATH,
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: process.env.LOG_INFO_MAX_FILE_SIZE,
  maxFiles: process.env.LOG_INFO_MAX_FILE_DAY,
  format: combine(timestamp(), json()),
  level: 'debug',
});

const transportError = new DailyRotateFile({
  filename: process.env.LOG_ERROR_FILE_PATH,
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: process.env.LOG_ERROR_MAX_FILE_SIZE,
  maxFiles: process.env.LOG_ERROR_MAX_FILE_DAY,
  format: combine(timestamp(), json()),
  level: 'warn',
});

const Logger = createLogger({
  transports: [transportError, transportInfo],
});

if (process.env.NODE_ENV == 'development') {
  Logger.add(new transports.Console());
}

module.exports = Logger;
