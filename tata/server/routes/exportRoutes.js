const express            = require("express");
const multer             = require("multer");
const requireAuth        = require("../middleware/requireAuth");
const { validatePDFUpload } = require("../validators/pdfValidator");
const { FILE_LIMITS }    = require("../constants/fileLimits");
const {
  uploadPDF,
  saveExport,
  getMyExports,
  deleteExport,
} = require("../controllers/exportController");

const router = express.Router();

// PDF upload — memory storage, 20 MB cap
const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: FILE_LIMITS.PDF_MAX_SIZE_BYTES },
});

// All export routes require a valid Clerk session
router.use(requireAuth);

router.post("/upload",  upload.single("file"), validatePDFUpload, uploadPDF);
router.post("/",        saveExport);   // metadata-only fallback
router.get("/",         getMyExports);
router.delete("/:id",   deleteExport);

module.exports = router;
