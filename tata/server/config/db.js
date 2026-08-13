const mongoose = require("mongoose");
const logger   = require("../utils/logger");

const connect = async () => {
  // 1 = connected, 2 = connecting — reuse existing connection in serverless
  if (mongoose.connection.readyState >= 1) return;

  await mongoose.connect(process.env.MONGO_URL, {
    serverSelectionTimeoutMS: 8000,
    socketTimeoutMS:          20000,
    bufferCommands:           false,
  });
  logger.info("MongoDB connected");
  // Errors bubble up to the caller — no process.exit here
};

module.exports = { connect };
