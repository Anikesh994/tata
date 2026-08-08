/**
 * constants/messages.js
 * All user-facing API messages in one place.
 * Avoids magic strings scattered across controllers.
 */

module.exports = {
  // Upload
  NO_FILE_UPLOADED:    "No file uploaded.",
  INVALID_FILE_TYPE:   "Only .csv files are allowed.",
  FILE_TOO_LARGE:      "File too large. Maximum allowed size is 5 MB.",
  CSV_EMPTY:           "CSV file is empty or could not be parsed.",
  UPLOAD_SUCCESS:      "Dataset uploaded successfully.",
  UPLOAD_FAILED:       "Failed to upload file. Please try again.",

  // Datasets
  DATASETS_FETCHED:    "Datasets retrieved successfully.",
  DATASET_FETCHED:     "Dataset retrieved successfully.",
  DATASET_NOT_FOUND:   "No datasets found.",
  DATASET_DELETED:     "Dataset deleted successfully.",
  DATASET_DELETE_FAIL: "Failed to delete dataset.",

  // Exports / PDF
  PDF_UPLOAD_SUCCESS:  "PDF exported and saved successfully.",
  PDF_UPLOAD_FAILED:   "Failed to upload PDF. Please try again.",
  INVALID_PDF_TYPE:    "Only PDF files are allowed.",
  PDF_TOO_LARGE:       "PDF too large. Maximum allowed size is 20 MB.",

  // General
  ROUTE_NOT_FOUND:     "Route not found.",
  SERVER_ERROR:        "Internal server error.",
};
