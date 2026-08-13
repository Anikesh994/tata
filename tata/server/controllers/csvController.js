/**
 * controllers/csvController.js
 *
 * Upload flow:
 *  1. Parse CSV from in-memory buffer
 *  2. Upload original CSV buffer to Cloudinary
 *  3. Serialize rows to JSON string, upload to Cloudinary, then free the string
 *  4. Save metadata only to MongoDB (no rows in DB)
 *  5. Return metadata + rows to client for immediate render
 */

const { Readable }               = require("stream");
const csv                        = require("csv-parser");
const { cloudinary }             = require("../config/cloudinary");
const Dataset                    = require("../models/Dataset");
const asyncHandler               = require("../utils/asyncHandler");
const { sendSuccess, sendError } = require("../utils/apiResponse");
const { sanitizeRow }            = require("../utils/csvSanitizer");
const MESSAGES                   = require("../constants/messages");
const logger                     = require("../utils/logger");

/* ── helpers ──────────────────────────────────────────────── */

/** Parse a Buffer through csv-parser, returning sanitized rows */
const parseCSVBuffer = (buffer) =>
  new Promise((resolve, reject) => {
    const rows = [];
    Readable.from(buffer)
      .pipe(csv())
      .on("data",  (row) => rows.push(sanitizeRow(row)))
      .on("end",   ()    => resolve(rows))
      .on("error", (err) => reject(err));
  });

/** Upload a Buffer to Cloudinary as a raw file */
const uploadToCloudinary = (buffer, name, format = "csv") =>
  new Promise((resolve, reject) => {
    const publicId = `insightboard/${Date.now()}_${name.replace(/\.[^.]+$/i, "")}`;
    const stream   = cloudinary.uploader.upload_stream(
      { public_id: publicId, resource_type: "raw", format, overwrite: false },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    Readable.from(buffer).pipe(stream);
  });

/* ── Upload CSV ──────────────────────────────────────────── */
exports.uploadCSV = asyncHandler(async (req, res) => {
  const { buffer, originalname, size } = req.file;

  // 1. Parse rows — keep them for response + JSON backup
  let rows;
  try {
    rows = await parseCSVBuffer(buffer);
  } catch (err) {
    logger.warn(`CSV parse failed for "${originalname}": ${err.message}`);
    return sendError(res, MESSAGES.CSV_EMPTY, 422);
  }
  if (!rows.length) {
    logger.warn(`Empty CSV uploaded: "${originalname}"`);
    return sendError(res, MESSAGES.CSV_EMPTY, 422);
  }

  // 2. Upload original CSV to Cloudinary
  let csvResult;
  try {
    csvResult = await uploadToCloudinary(buffer, originalname, "csv");
  } catch (err) {
    logger.error(`CSV Cloudinary upload failed: ${err.message}`);
    return sendError(res, MESSAGES.UPLOAD_FAILED, 502);
  }

  // 3. Upload JSON backup for dashboard recovery
  //    Build, upload, then let the buffer go out of scope immediately
  let jsonResult = null;
  try {
    const jsonBuffer = Buffer.from(JSON.stringify(rows));
    jsonResult = await uploadToCloudinary(
      jsonBuffer,
      originalname.replace(/\.csv$/i, ".json"),
      "json"
    );
    // jsonBuffer is now eligible for GC — no reference kept
  } catch (err) {
    logger.warn(`JSON backup upload failed: ${err.message}`);
    // Non-fatal — dashboard still works from the upload response
  }

  // 4. Save metadata only — no rows stored in MongoDB
  const dataset = await Dataset.create({
    name:               originalname,
    fileSize:           size,
    cloudinaryUrl:      csvResult.secure_url,
    cloudinaryPublicId: csvResult.public_id,
    jsonUrl:            jsonResult?.secure_url  ?? null,
    jsonPublicId:       jsonResult?.public_id   ?? null,
    rowCount:           rows.length,
    columns:            Object.keys(rows[0]),
    clerkUserId:        req.clerkUserId,        // always from requireAuth — never null
  });

  logger.info(`Dataset uploaded: "${originalname}" | rows=${rows.length} | user=${req.clerkUserId}`);

  // 5. Return metadata + rows so the client can render without a second fetch
  return sendSuccess(
    res,
    MESSAGES.UPLOAD_SUCCESS,
    { ...dataset.toObject(), data: rows },
    201
  );
});

/* ── Get all datasets (scoped to authenticated user) ─────── */
exports.getDatasets = asyncHandler(async (req, res) => {
  // req.clerkUserId is always set — requireAuth is on all CSV routes
  const datasets = await Dataset.find({ clerkUserId: req.clerkUserId })
    .select("-__v")
    .sort({ createdAt: -1 })
    .lean();

  return sendSuccess(res, MESSAGES.DATASETS_FETCHED, datasets);
});

/* ── Get latest dataset (scoped to authenticated user) ───── */
exports.getLatestDataset = asyncHandler(async (req, res) => {
  const latest = await Dataset.findOne({ clerkUserId: req.clerkUserId })
    .sort({ _id: -1 })
    .lean();

  if (!latest) return sendError(res, MESSAGES.DATASET_NOT_FOUND, 404);

  return sendSuccess(res, MESSAGES.DATASET_FETCHED, latest);
});

/* ── Delete dataset + both Cloudinary files ─────────────── */
exports.deleteDataset = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const dataset = await Dataset.findById(id);
  if (!dataset) return sendError(res, MESSAGES.DATASET_NOT_FOUND, 404);

  // Ownership check — 403 if the dataset belongs to a different user
  if (dataset.clerkUserId !== req.clerkUserId) {
    return sendError(res, "Access denied.", 403);
  }

  // Delete original CSV from Cloudinary
  try {
    await cloudinary.uploader.destroy(dataset.cloudinaryPublicId, { resource_type: "raw" });
  } catch (err) {
    logger.error(`CSV Cloudinary delete failed (${dataset.cloudinaryPublicId}): ${err.message}`);
    // Non-fatal — proceed to delete JSON and DB record
  }

  // Delete JSON backup from Cloudinary (only if it was saved)
  if (dataset.jsonPublicId) {
    try {
      await cloudinary.uploader.destroy(dataset.jsonPublicId, { resource_type: "raw" });
    } catch (err) {
      logger.error(`JSON Cloudinary delete failed (${dataset.jsonPublicId}): ${err.message}`);
      // Non-fatal
    }
  }

  await dataset.deleteOne();
  logger.info(`Dataset deleted: "${dataset.name}" | id=${id} | user=${req.clerkUserId}`);

  return sendSuccess(res, MESSAGES.DATASET_DELETED, null);
});
