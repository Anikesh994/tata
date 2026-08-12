

const mongoose = require("mongoose");
const logger   = require("../utils/logger");

const connect = async () => {
  // 1 = connected, 2 = connecting — skip if already live
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  try {
    await mongoose.connect(process.env.MONGO_URL, {
      serverSelectionTimeoutMS: 8000,  // fail fast on cold start
      socketTimeoutMS:          20000,
      // Required for serverless — don't keep connection alive indefinitely
      bufferCommands:           false,
    });
    logger.info("MongoDB connected");
  } catch (err) {
    logger.error(`MongoDB connection failed: ${err.message}`);
    throw err; /
  }
};

module.exports = { connect };
