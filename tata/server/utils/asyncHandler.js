/**
 * utils/asyncHandler.js
 * Wraps async route controllers so any thrown error
 * is automatically forwarded to Express error middleware.
 * Eliminates try/catch boilerplate in every controller.
 */

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
