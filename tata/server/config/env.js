/**
 * config/env.js
 * Validates required environment variables at startup.
 * Throws an Error (instead of process.exit) so the caller
 * can decide whether to crash — cleaner in serverless environments.
 */

const REQUIRED = [
  "MONGO_URL",
  "ALLOWED_ORIGIN",
  "CLERK_SECRET_KEY",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

const validate = () => {
  const missing = REQUIRED.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}\n` +
      "Set these in Vercel → Project Settings → Environment Variables"
    );
  }
};

module.exports = { validate };
