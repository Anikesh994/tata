const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const {
  saveExport,
  getMyExports,
  deleteExport,
} = require("../controllers/exportController");

const router = express.Router();

// All export routes require a valid Clerk session
router.use(requireAuth);

router.post("/",      saveExport);
router.get("/",       getMyExports);
router.delete("/:id", deleteExport);

module.exports = router;
