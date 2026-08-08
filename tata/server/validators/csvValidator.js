/**
 * validators/csvValidator.js
 * Validates uploaded file before the controller runs.
 * Keeps validation separate from business logic.
 */

const { sendError }   = require("../utils/apiResponse");
const MESSAGES        = require("../constants/messages");
const { FILE_LIMITS } = require("../constants/fileLimits");

// Browsers can send different MIME types for the same .csv file
const VALID_MIMES = [
  "text/csv",
  "application/csv",
  "application/vnd.ms-excel",
  "text/plain",
  "text/x-csv",
  "application/octet-stream", // some OS/browser combinations
];

const validateCSVUpload = (req, res, next) => {
  const file = req.file;

  if (!file) return sendError(res, MESSAGES.NO_FILE_UPLOADED, 400);

  // Extension is the most reliable check — always validate it
  if (!file.originalname.toLowerCase().endsWith(".csv")) {
    return sendError(res, MESSAGES.INVALID_FILE_TYPE, 415);
  }

  // MIME check is secondary — browsers are inconsistent
  if (!VALID_MIMES.includes(file.mimetype)) {
    return sendError(res, MESSAGES.INVALID_FILE_TYPE, 415);
  }

  if (file.size > FILE_LIMITS.MAX_SIZE_BYTES) {
    return sendError(res, MESSAGES.FILE_TOO_LARGE, 413);
  }

  return next();
};

module.exports = { validateCSVUpload };
