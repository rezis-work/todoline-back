import winston from "winston";
import fs from "fs";

if (!fs.existsSync("./logs")) {
  fs.mkdirSync("./logs");
}

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({
      filename: "./logs/error.log",
      level: "error",
    }),
    new winston.transports.File({ filename: "./logs/combined.log" }),
  ],
});

export function logInfo(message) {
  logger.info(message);
}

export function logError(message) {
  logger.error(message);
}
