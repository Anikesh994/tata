/**
 * server.js
 * Entry point. Wires config → middleware → routes → error handling.
 * Each concern lives in its own module — this file stays thin.
 */

const dotenv = require("dotenv");
dotenv.config();

// 1. Validate env vars before anything else loads
const { validate } = require("./config/env");
validate();

const express    = require("express");
const cors       = require("cors");
const { connect: connectDB }         = require("./config/db");
const { init: initCloudinary }       = require("./config/cloudinary");
const csvRoutes                      = require("./routes/csvRoutes");
const exportRoutes                   = require("./routes/exportRoutes");
const logger                         = require("./utils/logger");
const MESSAGES                       = require("./constants/messages");

// 2. Init third-party services
initCloudinary();

const app = express();

// 3. CORS
const allowedOrigins = [
  process.env.ALLOWED_ORIGIN,
  "http://localhost:5173",
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(Object.assign(new Error("CORS: origin not allowed"), { status: 403 }));
  },
}));

// 4. Body parsing — 1 MB cap (CSV rows never go in the body)
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// 5. Routes
app.use("/api/csv",     csvRoutes);
app.use("/api/exports", exportRoutes);

// 6. 404 — no matching route
app.use((_req, res) => {
  res.status(404).json({ success: false, message: MESSAGES.ROUTE_NOT_FOUND });
});

// 7. Centralized error middleware
// Must have 4 params so Express treats it as error handler
app.use((err, _req, res, _next) => {
  // Multer file-size error
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ success: false, message: MESSAGES.FILE_TOO_LARGE });
  }

  const status  = err.status || 500;
  const message = status < 500 ? err.message : MESSAGES.SERVER_ERROR;


  if (status >= 500) logger.error(`Unhandled error: ${err.message}`);

  return res.status(status).json({ success: false, message });
});

// 8. Connect to DB then start server
const startServer = async () => {
  await connectDB();

  // Skip listen() in Vercel — serverless handles it
  if (process.env.NODE_ENV !== "production") {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
  }
};

startServer();

module.exports = app;
