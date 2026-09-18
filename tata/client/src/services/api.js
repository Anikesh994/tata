import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30_000,
});

let _getToken = null;

export const registerTokenGetter = (fn) => { _getToken = fn; };

api.interceptors.request.use(async (config) => {
  if (_getToken) {
    try {
      const token = await _getToken();
      if (token) config.headers["Authorization"] = `Bearer ${token}`;
    } catch {
      // Failed to get token — let the request proceed, server will 401
    }
  }
  return config;
});

export const uploadCSV     = (formData) => api.post("/api/csv/upload", formData);
export const getDatasets   = ()         => api.get("/api/csv");
export const getLatest     = ()         => api.get("/api/csv/latest");
export const deleteDataset = (id)       => api.delete(`/api/csv/${id}`);

export const uploadPDF     = (formData) => api.post("/api/exports/upload", formData);
export const getExports    = ()         => api.get("/api/exports");
export const deleteExport  = (id)       => api.delete(`/api/exports/${id}`);

export default api;
