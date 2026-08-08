/**
 * controllers/exportController.js
 * Manages PDF export metadata.
 * PDFs are uploaded to Cloudinary server-side — API secret never exposed to client.
 */

const { Readable }   = require("stream");
const Export         = require("../models/Export");
const { cloudinary } = require("../config/cloudinary");
const asyncHandler   = require("../utils/asyncHandler");
const { sendSuccess, sendError } = require("../utils/apiResponse");
const MESSAGES       = require("../constants/messages");
const logger         = require("../utils/logger");

/* ── Helper: upload buffer to Cloudinary ─────────────────── */
const uploadPDFToCloudinary = (buffer, fileName) =>
  new Promise((resolve, reject) => {
    const publicId = `insightboard/exports/${Date.now()}_${fileName.replace(/\.pdf$/i, "")}`;

    const stream = cloudinary.uploader.upload_stream(
      {
        public_id:     publicId,
        resource_type: "raw",     // PDFs are non-image raw files
        format:        "pdf",
        overwrite:     false,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    Readable.from(buffer).pipe(stream);
  });

/* ── Upload PDF → Cloudinary → save metadata ─────────────── */
exports.uploadPDF = asyncHandler(async (req, res) => {
  // req.file validated by pdfValidator middleware
  // req.clerkUserId set by requireAuth middleware
  const { buffer, originalname, size } = req.file;

  let cloudinaryResult;
  try {
    cloudinaryResult = await uploadPDFToCloudinary(buffer, originalname);
  } catch (err) {
    logger.error(`PDF Cloudinary upload failed: ${err.message}`);
    return sendError(res, MESSAGES.PDF_UPLOAD_FAILED, 502);
  }

  const newExport = await Export.create({
    clerkUserId:        req.clerkUserId,
    fileName:           originalname,
    exportType:         "PDF",
    fileSize:           size,
    cloudinaryUrl:      cloudinaryResult.secure_url,
    cloudinaryPublicId: cloudinaryResult.public_id,
  });

  logger.info(`PDF exported: "${originalname}" | user=${req.clerkUserId}`);

  return sendSuccess(res, MESSAGES.PDF_UPLOAD_SUCCESS, newExport, 201);
});

/* ── Save export metadata only (no file) ─────────────────── */
exports.saveExport = asyncHandler(async (req, res) => {
  const { fileName, exportType = "PDF", fileSize = null } = req.body;

  if (!fileName) return sendError(res, "fileName is required.", 400);

  const newExport = await Export.create({
    clerkUserId: req.clerkUserId,
    fileName,
    exportType,
    fileSize,
  });

  return sendSuccess(res, "Export saved.", newExport, 201);
});

/* ── Get all exports for authenticated user ───────────────── */
exports.getMyExports = asyncHandler(async (req, res) => {
  const exports = await Export.find({ clerkUserId: req.clerkUserId })
    .sort({ createdAt: -1 })
    .lean();

  return sendSuccess(res, "Exports retrieved.", exports);
});

/* ── Delete export — owner only ───────────────────────────── */
exports.deleteExport = asyncHandler(async (req, res) => {
  const exportDoc = await Export.findById(req.params.id);

  if (!exportDoc) return sendError(res, "Export not found.", 404);

  // Enforce ownership — user ID from verified token, never from client
  if (exportDoc.clerkUserId !== req.clerkUserId) {
    return sendError(res, "Access denied.", 403);
  }

  // Remove from Cloudinary if it was uploaded there
  if (exportDoc.cloudinaryPublicId) {
    try {
      await cloudinary.uploader.destroy(exportDoc.cloudinaryPublicId, { resource_type: "raw" });
    } catch (err) {
      // Non-fatal — still delete the DB record
      logger.error(`Cloudinary PDF delete failed: ${err.message}`);
    }
  }

  await exportDoc.deleteOne();

  return sendSuccess(res, "Export deleted.");
});
