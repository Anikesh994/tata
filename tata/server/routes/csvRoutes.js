const express = require("express");
const multer = require("multer");
const { uploadCSV, getDatasets, getLatestDataset } = require("../controllers/csvController");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload", upload.single("file"), uploadCSV);
router.get("/", getDatasets);
router.get("/latest", getLatestDataset);

module.exports = router;
