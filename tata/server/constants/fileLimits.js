/**
 * constants/fileLimits.js
 * File upload constraints in one place.
 * Change the limit here and it propagates everywhere.
 */

const FILE_LIMITS = {
  MAX_SIZE_BYTES: 5 * 1024 * 1024,  // 5 MB
  MAX_SIZE_LABEL: "5 MB",
};

module.exports = { FILE_LIMITS };
