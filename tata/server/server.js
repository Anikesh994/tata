const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const csvRoutes = require("./routes/csvRoutes");
const exportRoutes = require("./routes/exportRoutes");

dotenv.config();

const app = express();

// Allow requests from the Vercel frontend (set ALLOWED_ORIGIN in Render env vars)
const allowedOrigins = [
  process.env.ALLOWED_ORIGIN,
  "http://localhost:5173",
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server calls (no origin) and listed origins
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
}));

// Increase body size limit to handle base64-encoded PDF exports (~5–15 MB)
app.use(bodyParser.json({ limit: "25mb" }));
app.use(bodyParser.urlencoded({ limit: "25mb", extended: true }));

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

app.use("/api/csv", csvRoutes);
app.use("/api/exports", exportRoutes);

// Export for Vercel serverless — only listen locally
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
