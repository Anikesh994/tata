/**
 * utils/logger.js
 * Lightweight structured logger using winston.
 * Outputs JSON in production, readable colorized text in development.
 */

const winston = require("winston");

const { combine, timestamp, colorize, printf, json } = winston.format;

const devFormat = combine(
  colorize(),
  timestamp({ format: "HH:mm:ss" }),
  printf(({ level, message, timestamp: ts }) => `${ts} [${level}] ${message}`)
);

const prodFormat = combine(timestamp(), json());

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: process.env.NODE_ENV === "production" ? prodFormat : devFormat,
  transports: [new winston.transports.Console()],
  // Never crash the app on a logging error
  exitOnError: false,
});

module.exports = logger;
