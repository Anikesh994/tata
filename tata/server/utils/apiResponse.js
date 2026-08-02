/**
 * utils/apiResponse.js
 * Single source of truth for API response shape.
 *
 * Success:  { success: true,  message, data }
 * Error:    { success: false, message }
 */

const sendSuccess = (res, message, data = null, statusCode = 200) =>
  res.status(statusCode).json({ success: true, message, data });

const sendError = (res, message, statusCode = 500) =>
  res.status(statusCode).json({ success: false, message });

module.exports = { sendSuccess, sendError };
