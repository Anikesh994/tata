/**
 * validators/pdfValidator.js
 * Validates the uploaded PDF file before the controller runs.
 * Same pattern as csvValidator — keeps validation out of business logic.
 */

const { sendError }   = require("../utils/apiResponse");
const MESSAGES        = require("../constants/messages");
const { FILE_LIMITS } = require("../constants/fileLimits");

const validatePDFUpload = (req, res, next) => {
  const file = req.file;

  if (!file) return sendError(res, MESSAGES.NO_FILE_UPLOADED, 400);

  // Extension check — most reliable signal
  if (!file.originalname.toLowerCase().endsWith(".pdf")) {
    return sendError(res, MESSAGES.INVALID_PDF_TYPE, 415);
  }

  // MIME check — application/pdf is the only accepted type for PDFs
  if (file.mimetype !== "application/pdf") {
    return sendError(res, MESSAGES.INVALID_PDF_TYPE, 415);
  }

  if (file.size > FILE_LIMITS.PDF_MAX_SIZE_BYTES) {
    return sendError(res, MESSAGES.PDF_TOO_LARGE, 413);
  }

  return next();
};

module.exports = { validatePDFUpload };
