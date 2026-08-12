/**
 * config/env.js
 * Validates all required environment variables at startup.
 * The app will refuse to start if any are missing — fail fast.
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

    console.error("=================================================");
    console.error("STARTUP FAILED — Missing environment variables:");
    missing.forEach((k) => console.error(`  • ${k}`));
    console.error("Set these in Vercel → Project Settings → Environment Variables");
    console.error("=================================================");
    process.exit(1);
  }
};

module.exports = { validate };
