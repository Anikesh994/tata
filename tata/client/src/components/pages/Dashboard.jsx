import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useAuth } from "@clerk/react";
import Navbar from "../Navbar";
import ChartDisplay from "../ChartDisplay";
import { savePdfLocally } from "../../utils/exportStorage";
import "./Dashboard.css";

const Toast = ({ message, type }) => (
  <div className={`toast-base ${type === "success" ? "toast-success" : "toast-error"}`}>
    <span>{type === "success" ? "✓" : "✕"}</span>
    {message}
  </div>
);

export default function Dashboard() {
  const { getToken } = useAuth();
  const [data, setData]               = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [file, setFile]               = useState(null);
  const [search, setSearch]           = useState("");
  const [uploading, setUploading]     = useState(false);
  const [dragOver, setDragOver]       = useState(false);
  const [toast, setToast]             = useState(null);
  const fileInputRef = useRef(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // NO auto-fetch on mount — data only appears after the user uploads
  // this ensures a fresh empty state every visit

  useEffect(() => {
    if (!search.trim()) { setFilteredData(data); return; }
    const q = search.toLowerCase();
    setFilteredData(data.filter((row) =>
      Object.values(row).some((v) => v?.toString().toLowerCase().includes(q))
    ));
  }, [search, data]);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/csv/upload`, fd);
      // Use the data returned directly from the upload response
      // so we never need to re-fetch from the DB
      const uploaded = res.data?.data || [];
      setData(uploaded);
      setFilteredData(uploaded);
      setSearch("");
      showToast("CSV uploaded successfully!", "success");
      setFile(null);
    } catch { showToast("Upload failed. Please try again.", "error"); }
    finally   { setUploading(false); }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.name.endsWith(".csv")) setFile(dropped);
    else showToast("Please drop a .csv file", "error");
  };

  const getSummary = () => {
    if (!filteredData.length) return { total: "—", average: "—", rows: 0, key: "" };
    const keys = Object.keys(filteredData[0]);
    let valueKey = keys[0];
    for (const k of keys) { if (!isNaN(parseFloat(filteredData[0][k]))) { valueKey = k; break; } }
    const vals = filteredData.map((r) => parseFloat(r[valueKey])).filter(Number.isFinite);
    if (!vals.length) return { total: "—", average: "—", rows: filteredData.length, key: valueKey };
    const total = vals.reduce((a, b) => a + b, 0);
    return {
      total:   total.toLocaleString(undefined, { maximumFractionDigits: 2 }),
      average: (total / vals.length).toLocaleString(undefined, { maximumFractionDigits: 2 }),
      rows: filteredData.length, key: valueKey,
    };
  };

  const exportPDF = async () => {
    const doc = new jsPDF("p", "pt", "a4");
    const capture = async (sel, y) => {
      const el = document.querySelector(sel);
      if (!el) return y;
      const canvas = await html2canvas(el, { scale: 2, backgroundColor: "#020409" });
      const w = doc.internal.pageSize.getWidth() - 80;
      const h = (canvas.height * w) / canvas.width;
      doc.addImage(canvas.toDataURL("image/png"), "PNG", 40, y, w, h);
      return y + h + 24;
    };
    let y = 40;
    y = await capture(".bento-row", y);
    y = await capture(".table-scroll", y);
    await capture(".chart-card", y);

    // Timestamped filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const fileName  = `insightboard_${timestamp}.pdf`;

    // 1 — capture base64 BEFORE triggering download (jsPDF resets state after save)
    const dataUri   = doc.output("datauristring");
    const fileSize  = Math.round((dataUri.length * 3) / 4); // approx bytes

    // 2 — trigger browser download
    doc.save(fileName);

    // 3 — save only metadata to the server (tiny payload, no file data)
    try {
      const token = await getToken();
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/exports`,
        { fileName, exportType: "PDF", fileSize },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 4 — store the actual PDF blob in IndexedDB using the DB record's _id
      await savePdfLocally(res.data._id, dataUri);

      showToast("PDF exported and saved to My Exports!", "success");
    } catch {
      showToast("PDF downloaded. Failed to save to My Exports.", "error");
    }
  };

  const headers = filteredData.length ? Object.keys(filteredData[0]) : [];
  const { total, average, rows, key } = getSummary();

  return (
    <div className="dash-page">
      <Navbar />

      <div className="dash-wrapper">

        {/* ── Page header ── */}
        <div className="dash-header">
          <div>
            <h1 className="dash-heading">Dashboard</h1>
            <p className="dash-subheading">Upload CSV files and explore your data visually.</p>
          </div>
          <button onClick={exportPDF} className="export-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export PDF
          </button>
        </div>

        {/* ── Top bento row ── */}
        <div className="bento-row">

          {/* Upload card */}
          <div className="dash-card">
            <p className="card-label">Upload Data</p>
            <div
              className={`drop-zone${dragOver ? " drop-zone-active" : ""}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              role="button" tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
            >
              <span className="drop-icon">📂</span>
              <p className="drop-text">
                <strong>Click to browse</strong> or drag & drop
              </p>
              <p className="drop-hint">Supports .csv files only</p>
              <input ref={fileInputRef} type="file" accept=".csv"
                style={{ display: "none" }} onChange={(e) => setFile(e.target.files[0])} />
            </div>

            {file && (
              <div className="file-pill">
                <span>📄</span>
                <span className="file-pill-name">{file.name}</span>
              </div>
            )}

            <button
              className={`upload-btn${uploading ? " upload-btn-loading" : ""}`}
              onClick={handleUpload}
              disabled={!file || uploading}
            >
              {uploading
                ? <><span className="spinner" /> Uploading...</>
                : <><span>⬆</span> Upload CSV</>
              }
            </button>
          </div>

          {/* Stat: Total */}
          <div className="dash-card stat-card">
            <p className="card-label">Total Value</p>
            <div className="stat-value">{total}</div>
            <p className="stat-key">{key || "No data"}</p>
            <span className="stat-pill stat-pill-blue">∑ Sum</span>
          </div>

          {/* Stat: Average */}
          <div className="dash-card stat-card">
            <p className="card-label">Average Value</p>
            <div className="stat-value">{average}</div>
            <p className="stat-key">{key || "No data"}</p>
            <span className="stat-pill stat-pill-violet">⌀ Mean</span>
          </div>
        </div>

        {/* Row count badge */}
        {rows > 0 && (
          <div style={{ marginBottom: "16px" }}>
            <span className="rows-badge">● {rows} rows loaded</span>
          </div>
        )}

        {/* ── Table ── */}
        <div className="dash-card table-card">
          <div className="table-header">
            <h2 className="table-title">Data Table</h2>
            <div className="search-wrap">
              <svg className="search-icon" width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text" value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search data…"
                className="filter-input"
              />
            </div>
          </div>

          <div className="table-scroll">
            {filteredData.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr className="table-head-row">
                    {headers.map((h) => <th key={h} className="table-th">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((row, i) => (
                    <tr key={i} className="table-body-row">
                      {headers.map((h) => <td key={h} className="table-td">{row[h]}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="table-empty">
                <span className="table-empty-icon">📋</span>
                <p>Upload a CSV file to see your data here.</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Chart ── */}
        <div className="dash-card chart-card">
          <p className="card-label">Data Visualization</p>
          <ChartDisplay rows={data} />
        </div>

      </div>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
