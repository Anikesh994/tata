/**
 * models/Dataset.js
 * Metadata only — raw CSV and parsed JSON live in Cloudinary.
 *
 * Migration note:
 *   Existing documents use "uploadedBy" instead of "clerkUserId".
 *   Both fields are included here so old records are still readable.
 *   New writes always use "clerkUserId".
 *   Run a one-off migration if you need to query old records by owner:
 *     db.datasets.updateMany({ uploadedBy: { $exists: true }, clerkUserId: { $exists: false } },
 *                             [{ $set: { clerkUserId: "$uploadedBy" } }])
 */

const mongoose = require("mongoose");

const DatasetSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true, maxlength: 255 },
    fileSize: { type: Number, required: true },

    // Cloudinary references — original CSV
    cloudinaryUrl:      { type: String, required: true },
    cloudinaryPublicId: { type: String, required: true },

    // Cloudinary references — parsed JSON backup (for dashboard recovery)
    jsonUrl:      { type: String, default: null },
    jsonPublicId: { type: String, default: null },

    // CSV metadata
    rowCount: { type: Number, required: true },
    columns:  { type: [String], required: true },

    // Owner — standardised to clerkUserId
    clerkUserId: { type: String, index: true, default: null },

    // Legacy field kept for backward compatibility with existing documents.
    // Do not write to this field — use clerkUserId for all new code.
    uploadedBy: { type: String, default: null },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Fast lookup: all datasets for a user, newest first
DatasetSchema.index({ clerkUserId: 1, createdAt: -1 });

module.exports = mongoose.model("Dataset", DatasetSchema);
