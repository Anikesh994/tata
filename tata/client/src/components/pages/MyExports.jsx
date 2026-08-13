import { useState, useEffect, useCallback } from "react";
import { getExports, deleteExport as apiDeleteExport } from "../../services/api";
import Navbar          from "../Navbar";
import ExportCard      from "../exports/ExportCard";
import Toast           from "../ui/Toast";
import LoadingSkeleton from "../ui/LoadingSkeleton";
import EmptyState      from "../ui/EmptyState";
import { getPdfLocally, savePdfLocally, deletePdfLocally } from "../../utils/exportStorage";
import "./MyExports.css";

export default function MyExports() {
  const [exports,     setExports]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [deleting,    setDeleting]    = useState(null);
  const [downloading, setDownloading] = useState(null);
  const [localAvail,  setLocalAvail]  = useState({});
  const [toast,       setToast]       = useState(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // ── Fetch export list + check IndexedDB availability ─────────────────────
  // Token is on the axios instance via App.jsx → no manual header needed
  const fetchExports = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await getExports();
      const list = res.data?.data ?? [];
      setExports(list);

      const avail = {};
      await Promise.all(
        list.map(async (exp) => {
          avail[exp._id] = !!(await getPdfLocally(exp._id));
        })
      );
      setLocalAvail(avail);
    } catch {
      showToast("Failed to load exports. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchExports(); }, [fetchExports]);

  // ── Download: IndexedDB first → Cloudinary fallback → cache locally ──────
  const handleDownload = async (id, fileName, cloudinaryUrl) => {
    setDownloading(id);
    try {
      let dataUri = await getPdfLocally(id);

      if (!dataUri) {
        if (cloudinaryUrl) {
          const res = await fetch(cloudinaryUrl);
          if (!res.ok) throw new Error("Cloudinary fetch failed");
          const blob = await res.blob();
          dataUri = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          });
          await savePdfLocally(id, dataUri);
          setLocalAvail((prev) => ({ ...prev, [id]: true }));
        } else {
          showToast("File not available on this device.", "error");
          return;
        }
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

  // ── Delete: server → IndexedDB → local state ─────────────────────────────
  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await apiDeleteExport(id);
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

        {/* Header */}
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

        {loading && <LoadingSkeleton />}
        {!loading && exports.length === 0 && <EmptyState />}

        {!loading && exports.length > 0 && (
          <>
            <p className="me-count">{exports.length} export{exports.length !== 1 ? "s" : ""}</p>
            <div className="me-grid">
              {exports.map((exp) => (
                <ExportCard
                  key={exp._id}
                  exp={exp}
                  hasLocal={localAvail[exp._id]}
                  downloading={downloading}
                  deleting={deleting}
                  onDownload={handleDownload}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </>
        )}

      </div>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
