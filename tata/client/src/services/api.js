/**
 * services/api.js
 * Single axios instance for all API calls.
 *
 * Auth:
 *   Call setAuthToken(token) once after Clerk loads to attach the
 *   Bearer token to every outgoing request automatically.
 *   All CSV and export routes require authentication.
 */

import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30_000,
});

/**
 * Attach (or remove) the Clerk session token on the shared axios instance.
 * Called from the top-level App or a layout component after Clerk loads.
 */
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

// ── CSV datasets ──────────────────────────────────────────
export const uploadCSV     = (formData) => api.post("/api/csv/upload", formData);
export const getDatasets   = ()         => api.get("/api/csv");
export const getLatest     = ()         => api.get("/api/csv/latest");
export const deleteDataset = (id)       => api.delete(`/api/csv/${id}`);

// ── Exports ───────────────────────────────────────────────
export const uploadPDF     = (formData) => api.post("/api/exports/upload", formData);
export const getExports    = ()         => api.get("/api/exports");
export const deleteExport  = (id)       => api.delete(`/api/exports/${id}`);

export default api;
