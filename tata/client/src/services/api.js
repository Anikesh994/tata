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
export const getLatest     = ()         => api.get("/api/csv/latest");
export const deleteDataset = (id)       => api.delete(`/api/csv/${id}`);

export default api;
