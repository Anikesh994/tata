/**
 * server.js
 * Entry point — wires config, middleware, routes, and error handling.
 *
 * Serverless (Vercel) notes:
 *  - module.exports = app  must be synchronous so Vercel can import it
 *  - DB connection is established on first request via a middleware,
 *    not at module load time — avoids timing issues on cold starts
 *  - process.exit() is never called — it would kill the entire instance
 */

const dotenv = require("dotenv");
dotenv.config();

const { validate }          = require("./config/env");
const express               = require("express");
const cors                  = require("cors");
const { connect: connectDB } = require("./config/db");
const { init: initCloudinary } = require("./config/cloudinary");
const csvRoutes             = require("./routes/csvRoutes");
const exportRoutes          = require("./routes/exportRoutes");
const logger                = require("./utils/logger");
const MESSAGES              = require("./constants/messages");


validate();

// Configure Cloudinary once at module load (synchronous, safe)
initCloudinary();

const app = express();

// ── CORS ────────────────────────────────────────────────────────────────────
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

// ── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.use(async (_req, _res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err); // passes to centralized error handler → 500 response
  }
});

// ── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/csv",     csvRoutes);
app.use("/api/exports", exportRoutes);

// ── 404 ──────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: MESSAGES.ROUTE_NOT_FOUND });
});

app.use((err, _req, res, _next) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ success: false, message: MESSAGES.FILE_TOO_LARGE });
  }
  const status  = err.status || 500;
  const message = status < 500 ? err.message : MESSAGES.SERVER_ERROR;
  if (status >= 500) logger.error(`Unhandled error: ${err.message}`);
  return res.status(status).json({ success: false, message });
});


if (process.env.NODE_ENV !== "production") {
  connectDB().then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
  }).catch((err) => {
    logger.error(`Startup failed: ${err.message}`);
    process.exit(1);
  });
}

// ── Export for Vercel serverless ─────────────────────────────────────────────
module.exports = app;
