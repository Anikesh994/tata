const mongoose = require("mongoose");

const ExportSchema = new mongoose.Schema(
  {
    clerkUserId: {
      type: String,
      required: true,
      index: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    exportType: {
      type: String,
      enum: ["PDF"],
      default: "PDF",
    },
    fileSize: {
      type: Number,
      default: null,
    },
    // Cloudinary URL enables cross-device PDF download
    cloudinaryUrl:      { type: String, default: null },
    cloudinaryPublicId: { type: String, default: null },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Export", ExportSchema);
