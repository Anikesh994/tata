/**
 * controllers/csvController.js
 * Route → Controller → Model architecture.
 *
 * Upload flow:
 *  1. Parse CSV from in-memory buffer (never touches disk)
 *  2. Upload original buffer to Cloudinary as a raw file
 *  3. Store only metadata in MongoDB
 *  4. Return metadata to client — client re-fetches CSV from Cloudinary when needed
 */

const { Readable }            = require("stream");
const csv                     = require("csv-parser");
const { cloudinary }          = require("../config/cloudinary");
const Dataset                 = require("../models/Dataset");
const asyncHandler            = require("../utils/asyncHandler");
const { sendSuccess, sendError } = require("../utils/apiResponse");
const { sanitizeRow }         = require("../utils/csvSanitizer");
const MESSAGES                = require("../constants/messages");
const logger                  = require("../utils/logger");

/* ── helpers ─────────────────────────────────────────────── */

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

/** Upload a raw Buffer to Cloudinary */
const uploadBufferToCloudinary = (buffer, originalName, resourceType = "raw", format = "csv") =>
  new Promise((resolve, reject) => {
    const baseName = originalName.replace(/\.[^.]+$/i, "");
    const publicId = `insightboard/${Date.now()}_${baseName}`;

    const stream = cloudinary.uploader.upload_stream(
      { public_id: publicId, resource_type: resourceType, format, overwrite: false },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    Readable.from(buffer).pipe(stream);
  });

/* ── Upload CSV ──────────────────────────────────────────── */
exports.uploadCSV = asyncHandler(async (req, res) => {
  // req.file already validated by csvValidator middleware
  const { buffer, originalname, size } = req.file;

  // 1. Parse CSV rows from memory
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

  // 2. Upload original file to Cloudinary
  let cloudinaryResult;
  try {
    cloudinaryResult = await uploadBufferToCloudinary(buffer, originalname);
  } catch (err) {
    logger.error(`Cloudinary upload failed for "${originalname}": ${err.message}`);
    return sendError(res, MESSAGES.UPLOAD_FAILED, 502);
  }

  // 3. Also upload parsed JSON to Cloudinary for dashboard recovery after refresh
  let jsonResult;
  try {
    const jsonBuffer = Buffer.from(JSON.stringify(rows));
    jsonResult = await uploadBufferToCloudinary(jsonBuffer, originalname.replace(/\.csv$/i, ".json"), "raw", "json");
  } catch (err) {
    // Non-fatal: dashboard still works from the upload response
    logger.warn(`JSON backup upload failed for "${originalname}": ${err.message}`);
    jsonResult = null;
  }

  // 4. Save metadata to MongoDB
  const dataset = await Dataset.create({
    name:               originalname,
    fileSize:           size,
    cloudinaryUrl:      cloudinaryResult.secure_url,
    cloudinaryPublicId: cloudinaryResult.public_id,
    jsonUrl:            jsonResult?.secure_url ?? null,
    rowCount:           rows.length,
    columns:            Object.keys(rows[0]),
    uploadedBy:         req.clerkUserId ?? null,
  });

  logger.info(`Dataset uploaded: "${originalname}" | rows=${rows.length} | user=${dataset.uploadedBy ?? "anonymous"}`);

  // 5. Return metadata + parsed rows so the client can render immediately
  return sendSuccess(
    res,
    MESSAGES.UPLOAD_SUCCESS,
    { ...dataset.toObject(), data: rows },
    201
  );
});

/* ── Get all datasets (scoped to current user) ───────────── */
exports.getDatasets = asyncHandler(async (req, res) => {
  // If auth middleware ran, filter by user; otherwise return all (public mode)
  const filter = req.clerkUserId ? { uploadedBy: req.clerkUserId } : {};
  const datasets = await Dataset.find(filter)
    .select("-__v")
    .sort({ createdAt: -1 })
    .lean();

  return sendSuccess(res, MESSAGES.DATASETS_FETCHED, datasets);
});

/* ── Get latest dataset (scoped to current user) ─────────── */
exports.getLatestDataset = asyncHandler(async (req, res) => {
  const filter = req.clerkUserId ? { uploadedBy: req.clerkUserId } : {};
  const latest = await Dataset.findOne(filter)
    .sort({ _id: -1 })
    .lean();

  if (!latest) return sendError(res, MESSAGES.DATASET_NOT_FOUND, 404);

  return sendSuccess(res, MESSAGES.DATASET_FETCHED, latest);
});

/* ── Delete dataset + remove from Cloudinary ────────────── */
exports.deleteDataset = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const dataset = await Dataset.findById(id);
  if (!dataset) return sendError(res, MESSAGES.DATASET_NOT_FOUND, 404);

  // Remove from Cloudinary first — if this fails we keep the DB record
  try {
    await cloudinary.uploader.destroy(dataset.cloudinaryPublicId, {
      resource_type: "raw",
    });
  } catch (err) {
    logger.error(`Cloudinary delete failed for "${dataset.cloudinaryPublicId}": ${err.message}`);
    // Non-fatal: delete the DB record anyway so the user isn't stuck
  }

  await dataset.deleteOne();

  logger.info(`Dataset deleted: "${dataset.name}" | id=${id}`);

  return sendSuccess(res, MESSAGES.DATASET_DELETED, null);
});
