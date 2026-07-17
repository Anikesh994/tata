const Export = require("../models/Export");

/**
 * POST /api/exports
 * Save export metadata only — no file data.
 * Body: { fileName, exportType, fileSize }
 */
exports.saveExport = async (req, res) => {
  try {
    const { fileName, exportType = "PDF", fileSize = null } = req.body;

    if (!fileName) {
      return res.status(400).json({ error: "fileName is required" });
    }

    const newExport = new Export({
      clerkUserId: req.clerkUserId, // always from verified token, never from body
      fileName,
      exportType,
      fileSize,
    });

    await newExport.save();
    res.status(201).json(newExport);
  } catch (err) {
    console.error("saveExport error:", err);
    res.status(500).json({ error: "Failed to save export" });
  }
};

/**
 * GET /api/exports
 * Return all export metadata for the authenticated user (newest first).
 */
exports.getMyExports = async (req, res) => {
  try {
    const exports = await Export.find({ clerkUserId: req.clerkUserId })
      .sort({ createdAt: -1 });

    res.json(exports);
  } catch (err) {
    console.error("getMyExports error:", err);
    res.status(500).json({ error: "Failed to fetch exports" });
  }
};

/**
 * DELETE /api/exports/:id
 * Delete a single export record. Only the owner may delete.
 */
exports.deleteExport = async (req, res) => {
  try {
    const exportDoc = await Export.findById(req.params.id);

    if (!exportDoc) {
      return res.status(404).json({ error: "Export not found" });
    }

    if (exportDoc.clerkUserId !== req.clerkUserId) {
      return res.status(403).json({ error: "Access denied" });
    }

    await exportDoc.deleteOne();
    res.json({ message: "Export deleted successfully" });
  } catch (err) {
    console.error("deleteExport error:", err);
    res.status(500).json({ error: "Failed to delete export" });
  }
};
