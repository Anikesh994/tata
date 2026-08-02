/**
 * validators/csvValidator.js
 * Express middleware that validates the uploaded file
 * before the request reaches the controller.
 * Keeps validation logic out of business logic.
 */

const { sendError }  = require("../utils/apiResponse");
const MESSAGES       = require("../constants/messages");
const { FILE_LIMITS } = require("../constants/fileLimits");

const VALID_MIMES = ["text/csv", "application/vnd.ms-excel", "text/plain"];

/**
 * Validates that:
 *  1. A file was attached to the request.
 *  2. The file extension is .csv.
 *  3. The MIME type is acceptable.
 *  4. The file size is within the allowed limit.
 */
const validateCSVUpload = (req, res, next) => {
  const file = req.file;

  if (!file) {
    return sendError(res, MESSAGES.NO_FILE_UPLOADED, 400);
  }

  const hasValidExt  = file.originalname.toLowerCase().endsWith(".csv");
  const hasValidMime = VALID_MIMES.includes(file.mimetype);

  if (!hasValidExt || !hasValidMime) {
    return sendError(res, MESSAGES.INVALID_FILE_TYPE, 415);
  }

  if (file.size > FILE_LIMITS.MAX_SIZE_BYTES) {
    return sendError(res, MESSAGES.FILE_TOO_LARGE, 413);
  }

  // Validation passed: continue to the upload controller.
  return next();
};

module.exports = { validateCSVUpload };
