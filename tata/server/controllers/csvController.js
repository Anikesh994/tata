const { Readable } = require("stream");
const csv = require("csv-parser");
const Dataset = require("../models/Dataset");

exports.uploadCSV = async (req, res) => {
  const results = [];

  // Parse directly from the in-memory buffer — no temp file needed
  const stream = Readable.from(req.file.buffer);

  stream
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", async () => {
      const dataset = new Dataset({ name: req.file.originalname, data: results });
      await dataset.save();
      res.json(dataset);
    })
    .on("error", (err) => {
      res.status(500).json({ error: "Failed to parse CSV", details: err.message });
    });
};

exports.getDatasets = async (req, res) => {
  const datasets = await Dataset.find();
  res.json(datasets);
};

exports.getLatestDataset = async (req, res) => {
  try {
    const latestDataset = await Dataset.findOne().sort({ _id: -1 });
    if (!latestDataset) {
      return res.status(404).json({ message: "No data found" });
    }
    res.json(latestDataset);
  } catch (error) {
    res.status(500).json({ error: "Server error fetching latest data" });
  }
};
