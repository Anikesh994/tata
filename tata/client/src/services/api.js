/**
 * services/api.js
 * Single axios instance — one place to change the base URL,
 * timeouts, or add auth headers globally.
 */

import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30_000, // 30 s — generous for serverless cold starts
});

// ── CSV datasets ──────────────────────────────────────────
export const uploadCSV     = (formData) => api.post("/api/csv/upload", formData);
export const getDatasets   = ()         => api.get("/api/csv");
export const getLatest     = (token) => api.get("/api/csv/latest", token
  ? { headers: { Authorization: `Bearer ${token}` } }
  : {});
export const deleteDataset = (id)       => api.delete(`/api/csv/${id}`);

// ── Exports ───────────────────────────────────────────────
// Sends the PDF binary to the backend — Cloudinary credentials never touch the client
export const uploadPDF = (formData, token) =>
  api.post("/api/exports/upload", formData, {
    headers: { Authorization: `Bearer ${token}` },
  });

export default api;
