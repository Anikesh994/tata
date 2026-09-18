
const mongoose = require("mongoose");

const DatasetSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true, maxlength: 255 },
    fileSize: { type: Number, required: true },

    cloudinaryUrl:      { type: String, required: true },
    cloudinaryPublicId: { type: String, required: true },

    jsonUrl:      { type: String, default: null },
    jsonPublicId: { type: String, default: null },

    rowCount: { type: Number, required: true },
    columns:  { type: [String], required: true },


    clerkUserId: { type: String, index: true, default: null },

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
