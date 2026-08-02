/**
 * Handles MongoDB connection. Isolated so server.js stays clean.
 */

const mongoose = require("mongoose");
const logger   = require("../utils/logger");

const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      serverSelectionTimeoutMS: 5000,
    });
    logger.info("MongoDB connected successfully");
  } catch (err) {
    logger.error(`MongoDB connection failed: ${err.message}`);
    process.exit(1);
  }
};

module.exports = { connect };
