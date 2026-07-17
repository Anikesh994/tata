import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "@clerk/react";
import Navbar from "../Navbar";
import { getPdfLocally, deletePdfLocally } from "../../utils/exportStorage";
import "./MyExports.css";

/* ── Toast ── */
const Toast = ({ message, type }) => (
  <div className={`toast-base ${type === "success" ? "toast-success" : "toast-error"}`}>
    <span>{type === "success" ? "✓" : "✕"}</span>
    {message}
  </div>
);

/* ── Helpers ── */
function formatBytes(bytes) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso) {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function MyExports() {
  const { getToken } = useAuth();

  const [exports,     setExports]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [deleting,    setDeleting]    = useState(null);
  const [downloading, setDownloading] = useState(null);
  // track which exports have a local PDF available
  const [localAvail,  setLocalAvail]  = useState({});
  const [toast,       setToast]       = useState(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  /* ── Fetch export list ── */
  const fetchExports = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/exports`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExports(res.data);

      // Check IndexedDB availability for each export
      const avail = {};
      await Promise.all(
        res.data.map(async (exp) => {
          const data = await getPdfLocally(exp._id);
          avail[exp._id] = !!data;
        })
      );
      setLocalAvail(avail);
    } catch {
      showToast("Failed to load exports. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  }, [getToken, showToast]);

  useEffect(() => { fetchExports(); }, [fetchExports]);

  /* ── Download from IndexedDB ── */
  const handleDownload = async (id, fileName) => {
    setDownloading(id);
    try {
      const dataUri = await getPdfLocally(id);
      if (!dataUri) {
        showToast("File not available on this device.", "error");
        return;
      }
      const link = document.createElement("a");
      link.href = dataUri;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("Download started!", "success");
    } catch {
      showToast("Failed to download export.", "error");
    } finally {
      setDownloading(null);
    }
  };

  /* ── Delete ── */
  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      const token = await getToken();
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/exports/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Also wipe from IndexedDB
      await deletePdfLocally(id);
      setExports((prev) => prev.filter((e) => e._id !== id));
      showToast("Export deleted.", "success");
    } catch {
      showToast("Failed to delete export.", "error");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="me-page">
      <Navbar />

      <div className="me-wrapper">

        {/* ── Header ── */}
        <div className="me-header">
          <div>
            <h1 className="me-heading">My Exports</h1>
            <p className="me-subheading">All PDF reports you have exported from the dashboard.</p>
          </div>
          <button onClick={fetchExports} className="me-refresh-btn" disabled={loading}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round"
              className={loading ? "me-spin" : ""}>
              <polyline points="23 4 23 10 17 10"/>
              <polyline points="1 20 1 14 7 14"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
            Refresh
          </button>
        </div>

        {/* ── Loading skeleton ── */}
        {loading && (
          <div className="me-skeleton-grid">
            {[1, 2, 3].map((n) => (
              <div key={n} className="me-skeleton-card">
                <div className="me-skeleton-line me-skeleton-title" />
                <div className="me-skeleton-line me-skeleton-meta" />
                <div className="me-skeleton-line me-skeleton-meta" style={{ width: "55%" }} />
                <div className="me-skeleton-actions">
                  <div className="me-skeleton-btn" />
                  <div className="me-skeleton-btn" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Empty state ── */}
        {!loading && exports.length === 0 && (
          <div className="me-empty">
            <span className="me-empty-icon">📂</span>
            <p className="me-empty-title">No exports yet</p>
            <p className="me-empty-sub">
              Head to the <a href="/dashboard" className="me-link">Dashboard</a> and click
              &ldquo;Export PDF&rdquo; to generate your first export.
            </p>
          </div>
        )}

        {/* ── Exports grid ── */}
        {!loading && exports.length > 0 && (
          <>
            <p className="me-count">{exports.length} export{exports.length !== 1 ? "s" : ""}</p>

            <div className="me-grid">
              {exports.map((exp) => {
                const hasLocal = localAvail[exp._id];
                return (
                  <div key={exp._id} className="me-card">

                    {/* Top */}
                    <div className="me-card-top">
                      <div className="me-pdf-icon">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="1.5"
                          strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                          <polyline points="14 2 14 8 20 8"/>
                          <line x1="16" y1="13" x2="8" y2="13"/>
                          <line x1="16" y1="17" x2="8" y2="17"/>
                          <polyline points="10 9 9 9 8 9"/>
                        </svg>
                      </div>
                      <div className="me-card-info">
                        <p className="me-card-name" title={exp.fileName}>{exp.fileName}</p>
                        <span className="me-type-badge">{exp.exportType}</span>
                      </div>
                    </div>

                    {/* Meta */}
                    <div className="me-card-meta">
                      <div className="me-meta-item">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="2"
                          strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                          <line x1="16" y1="2" x2="16" y2="6"/>
                          <line x1="8"  y1="2" x2="8"  y2="6"/>
                          <line x1="3"  y1="10" x2="21" y2="10"/>
                        </svg>
                        {formatDate(exp.createdAt)}
                      </div>
                      {exp.fileSize && (
                        <div className="me-meta-item">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2"
                            strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                            <polyline points="7 10 12 15 17 10"/>
                            <line x1="12" y1="15" x2="12" y2="3"/>
                          </svg>
                          {formatBytes(exp.fileSize)}
                        </div>
                      )}
                      {/* Availability badge */}
                      <div className="me-meta-item">
                        {hasLocal
                          ? <span className="me-avail-badge me-avail-yes">● Available on this device</span>
                          : <span className="me-avail-badge me-avail-no">○ Exported on another device</span>
                        }
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="me-card-actions">
                      <button
                        className="me-download-btn"
                        onClick={() => handleDownload(exp._id, exp.fileName)}
                        disabled={!hasLocal || downloading === exp._id || deleting === exp._id}
                        title={hasLocal ? "Download PDF" : "Not available on this device"}
                      >
                        {downloading === exp._id ? (
                          <><span className="me-spinner" /> Downloading…</>
                        ) : (
                          <>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                              stroke="currentColor" strokeWidth="2"
                              strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                              <polyline points="7 10 12 15 17 10"/>
                              <line x1="12" y1="15" x2="12" y2="3"/>
                            </svg>
                            Download
                          </>
                        )}
                      </button>

                      <button
                        className="me-delete-btn"
                        onClick={() => handleDelete(exp._id)}
                        disabled={deleting === exp._id || downloading === exp._id}
                      >
                        {deleting === exp._id ? (
                          <><span className="me-spinner me-spinner-red" /> Deleting…</>
                        ) : (
                          <>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                              stroke="currentColor" strokeWidth="2"
                              strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                              <path d="M10 11v6M14 11v6"/>
                              <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                            </svg>
                            Delete
                          </>
                        )}
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          </>
        )}

      </div>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
