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
      type: Number, // bytes
      default: null,
    },
    // NOTE: file data is NOT stored in the DB — it lives in browser IndexedDB.
    // This keeps documents small and avoids payload limits entirely.
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Export", ExportSchema);
