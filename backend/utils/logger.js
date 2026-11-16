const winston = require('winston');
const path = require('path');
const { redactInfo } = require('./logRedaction');

// Create the logs directory. recursive: true makes this safe when several
// processes start at once (node --test runs test files in parallel).
const fs = require('fs');
const logDir = 'logs';
fs.mkdirSync(logDir, { recursive: true });

// Strips request bodies, submitted values and email addresses from every
// entry (see utils/logRedaction.js). Runs after errors() so error objects are
// already flattened into the info object.
const redact = winston.format((info) => redactInfo(info));

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  redact(),
  winston.format.json()
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'resume-builder-api' },
  transports: [
    // Write all logs with level 'error' and below to error.log
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    }),
    // Write all logs to combined.log
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    }),
  ],
});

// Add console transport for development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

module.exports = logger; 