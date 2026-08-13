/**
 * routes/csvRoutes.js
 * Multer handles file buffering, csvValidator checks it,
 * then the request reaches the controller — clean separation.
 */

const express                  = require("express");
const multer                   = require("multer");
const { uploadCSV, getDatasets, getLatestDataset, deleteDataset } =
  require("../controllers/csvController");
const { validateCSVUpload }    = require("../validators/csvValidator");
const { FILE_LIMITS }          = require("../constants/fileLimits");
const requireAuth              = require("../middleware/requireAuth");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: FILE_LIMITS.MAX_SIZE_BYTES },
});

// All CSV routes require authentication
router.use(requireAuth);

router.post(   "/upload",    upload.single("file"), validateCSVUpload, uploadCSV);
router.get(    "/",          getDatasets);
router.get(    "/latest",    getLatestDataset);
router.delete( "/:id",       deleteDataset);

module.exports = router;
