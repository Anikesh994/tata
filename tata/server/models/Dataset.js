/**
 * models/Dataset.js
 * Stores only CSV metadata — the original file lives in Cloudinary.
 * No raw row data in MongoDB → no document size issues.
 */

const mongoose = require("mongoose");

const DatasetSchema = new mongoose.Schema(
  {
    // Original file info
    name:     { type: String, required: true, trim: true, maxlength: 255 },
    fileSize: { type: Number, required: true },   // bytes

    cloudinaryUrl:      { type: String, required: true },
    cloudinaryPublicId: { type: String, required: true },

    // CSV metadata (derived at upload time, no need to re-download)
    rowCount: { type: Number, required: true },
    columns:  { type: [String], required: true },

    // Auth — Clerk user ID, enables per-user isolation later
    uploadedBy: { type: String, default: null, index: true },
  },
  {
    timestamps: true,   
    versionKey: false,  // removes noisy __v field
  }
);

// Compound index: list a user's datasets sorted by newest first
DatasetSchema.index({ uploadedBy: 1, createdAt: -1 });

module.exports = mongoose.model("Dataset", DatasetSchema);
