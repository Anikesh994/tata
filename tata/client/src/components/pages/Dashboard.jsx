import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { uploadCSV as apiUpload, getLatest, uploadPDF as apiUploadPDF } from "../../services/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";
import Navbar from "../Navbar";
import ChartDisplay from "../ChartDisplay";
import UploadCard from "../dashboard/UploadCard";
import StatCard   from "../dashboard/StatCard";
import DataTable  from "../dashboard/DataTable";
import Toast      from "../ui/Toast";
import { savePdfLocally } from "../../utils/exportStorage";
import "./Dashboard.css";

export default function Dashboard() {
  const [data,            setData]            = useState([]);
  const [filteredData,    setFilteredData]    = useState([]);
  const [file,            setFile]            = useState(null);
  const [search,          setSearch]          = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [metricKey,       setMetricKey]       = useState("");
  const [page,            setPage]            = useState(1);
  const [uploading,       setUploading]       = useState(false);
  const [dragOver,        setDragOver]        = useState(false);
  const [toast,           setToast]           = useState(null);

  const PAGE_SIZE = 25;

  const fileInputRef = useRef(null);
  const chartRef     = useRef(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const numericKeys = useMemo(() => {
    if (!data.length) return [];
    const sample = data.slice(0, 50);
    return Object.keys(data[0]).filter((k) => {
      const nonEmpty = sample.filter((r) => r[k] !== "" && r[k] != null);
      if (!nonEmpty.length) return false;
      return nonEmpty.filter((r) => Number.isFinite(parseFloat(r[k]))).length / nonEmpty.length >= 0.8;
    });
  }, [data]);

  useEffect(() => {
    if (numericKeys.length) setMetricKey((prev) => (numericKeys.includes(prev) ? prev : numericKeys[0]));
  }, [numericKeys]);

  // ── Mount: silently restore last dataset from Cloudinary ─────────────────
  useEffect(() => {
    let cancelled = false;
    const restore = async () => {
      try {
        // Token is already on the axios instance via App.jsx → setAuthToken
        const res  = await getLatest();
        const meta = res.data?.data;
        if (!meta?.jsonUrl || cancelled) return;
        const jsonRes = await fetch(meta.jsonUrl);
        if (!jsonRes.ok  || cancelled) return;
        const rows = await jsonRes.json();
        if (!cancelled && Array.isArray(rows) && rows.length) {
          setData(rows);
          setFilteredData(rows);
        }
      } catch {
        // Silently fail — empty state is acceptable
      }
    };
    restore();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Search filter ─────────────────────────────────────────────────────────
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 800);
    return () => clearTimeout(id);
  }, [search]);

  useEffect(() => {
    if (!debouncedSearch.trim()) { setFilteredData(data); setPage(1); return; }
    const q = debouncedSearch.toLowerCase();
    setFilteredData(
      data.filter((row) =>
        Object.values(row).some((v) => v?.toString().toLowerCase().includes(q))
      )
    );
    setPage(1);
  }, [debouncedSearch, data]);

  // ── CSV upload ────────────────────────────────────────────────────────────
  const handleUpload = async () => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".csv")) {
      return showToast("Only .csv files are supported.", "error");
    }
    if (file.size > 5 * 1024 * 1024) {
      return showToast("File too large. Max size is 5 MB.", "error");
    }
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await apiUpload(fd);
      // Server returns { success, message, data: { ...metadata, data: rows[] } }
      const uploaded = res.data?.data?.data ?? [];
      setData(uploaded);
      setFilteredData(uploaded);
      setSearch("");
      setDebouncedSearch("");
      setPage(1);
      showToast("CSV uploaded successfully!", "success");
      setFile(null);
    } catch (err) {
      const msg = err.response?.data?.message || "Upload failed. Please try again.";
      showToast(msg, "error");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.name.endsWith(".csv")) setFile(dropped);
    else showToast("Please drop a .csv file", "error");
  };

  // ── Summary stats (memoised — recalculates only when filteredData changes) ─
  const summary = useMemo(() => {
    if (!filteredData.length || !metricKey) return { total: "—", average: "—", rows: 0 };
    const vals = filteredData.map((r) => parseFloat(r[metricKey])).filter(Number.isFinite);
    if (!vals.length) return { total: "—", average: "—", rows: filteredData.length };
    const total = vals.reduce((a, b) => a + b, 0);
    return {
      total:   total.toLocaleString(undefined, { maximumFractionDigits: 2 }),
      average: (total / vals.length).toLocaleString(undefined, { maximumFractionDigits: 2 }),
      rows:    filteredData.length,
    };
  }, [filteredData, metricKey]);

  // ── PDF export ────────────────────────────────────────────────────────────
  //
  // Three sections, three different strategies:
  //
  //  1. Bento stats row  → html2canvas PNG (scale 2) — small, visually rich
  //  2. Data table       → jspdf-autotable (native vector text, ~50 KB)
  //  3. Chart            → Chart.js canvas.toDataURL() — direct grab, no html2canvas
  //
  const exportPDF = async () => {
    const doc       = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4", compress: true });
    const PAGE_W    = doc.internal.pageSize.getWidth();
    const PAGE_H    = doc.internal.pageSize.getHeight();
    const MARGIN    = 36;
    const CONTENT_W = PAGE_W - MARGIN * 2;

    // Capture a DOM element as a PNG and embed it
    const captureElement = async (selector, yPos) => {
      const el = document.querySelector(selector);
      if (!el) return yPos;
      const canvas = await html2canvas(el, {
        scale: 2, backgroundColor: "#020409", useCORS: true, logging: false,
      });
      const imgW = CONTENT_W;
      const imgH = (canvas.height / canvas.width) * imgW;
      if (yPos + imgH > PAGE_H - MARGIN) { doc.addPage(); yPos = MARGIN; }
      doc.addImage(canvas.toDataURL("image/png"), "PNG", MARGIN, yPos, imgW, imgH);
      return yPos + imgH + 14;
    };

    // Grab Chart.js canvas directly — bypasses html2canvas entirely
    const embedChart = (yPos) => {
      const chartCanvas = chartRef.current?.querySelector("canvas");
      if (!chartCanvas) return yPos;
      const imgW = CONTENT_W;
      const imgH = (chartCanvas.height / chartCanvas.width) * imgW;
      if (yPos + imgH > PAGE_H - MARGIN) { doc.addPage(); yPos = MARGIN; }
      doc.setFontSize(8);
      doc.setTextColor(56, 189, 248);
      doc.text("DATA VISUALIZATION", MARGIN, yPos);
      yPos += 12;
      doc.addImage(chartCanvas.toDataURL("image/png"), "PNG", MARGIN, yPos, imgW, imgH);
      return yPos + imgH + 14;
    };

    // Render data table as native PDF vector text via autoTable
    const renderAutoTable = (yPos) => {
      if (!filteredData.length) return yPos;
      const cols = Object.keys(filteredData[0]);
      doc.setFontSize(8);
      doc.setTextColor(56, 189, 248);
      doc.text("DATA TABLE", MARGIN, yPos);
      yPos += 10;
      autoTable(doc, {
        startY:     yPos,
        margin:     { left: MARGIN, right: MARGIN },
        tableWidth: CONTENT_W,
        columns:    cols.map((col) => ({ header: col, dataKey: col })),
        body:       filteredData,
        theme:      "grid",
        headStyles: {
          fillColor: [15, 23, 42], textColor: [148, 163, 184],
          fontStyle: "bold", fontSize: 7.5,
          cellPadding: { top: 5, bottom: 5, left: 4, right: 4 },
          lineColor: [30, 41, 59], lineWidth: 0.5,
        },
        bodyStyles: {
          fillColor: [8, 14, 32], textColor: [203, 213, 225],
          fontSize: 7,
          cellPadding: { top: 4, bottom: 4, left: 4, right: 4 },
          lineColor: [30, 41, 59], lineWidth: 0.3,
        },
        alternateRowStyles: { fillColor: [15, 23, 42] },
        columnStyles: Object.fromEntries(
          cols.map((_, i) => [i, { overflow: "ellipsize", minCellWidth: 30 }])
        ),
        showHead: "everyPage",
      });
      return doc.lastAutoTable.finalY + 14;
    };

    // Cover header
    doc.setFontSize(16);
    doc.setTextColor(248, 250, 252);
    doc.text("InsightBoard — Dashboard Report", MARGIN, MARGIN);
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `Generated ${new Date().toLocaleString()}  ·  ${filteredData.length} rows`,
      MARGIN, MARGIN + 18
    );

    let y = MARGIN + 38;
    y = await captureElement(".bento-row", y);
    y = renderAutoTable(y);
    y = embedChart(y);

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const fileName  = `insightboard_${timestamp}.pdf`;

    // Capture both outputs BEFORE save() resets jsPDF internal state
    const dataUri = doc.output("datauristring");
    const blob    = doc.output("blob");
    doc.save(fileName);

    // Upload to backend → Cloudinary (token is on axios instance via App.jsx)
    try {
      const formData = new FormData();
      formData.append("file", new File([blob], fileName, { type: "application/pdf" }));
      const res      = await apiUploadPDF(formData);
      const exportId = res.data?.data?._id;
      if (exportId) await savePdfLocally(exportId, dataUri);
      showToast("PDF exported and saved to My Exports!", "success");
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to save to My Exports.";
      showToast(`PDF downloaded. ${msg}`, "error");
    }
  };

  const headers  = filteredData.length ? Object.keys(filteredData[0]) : [];
  const { total, average, rows } = summary;
  const totalPages = Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const pageData   = filteredData.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="dash-page">
      <Navbar />

      <div className="dash-wrapper">

        {/* Page header */}
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

        {/* Top bento row */}
        <div className="bento-row">
          <UploadCard
            file={file}
            uploading={uploading}
            dragOver={dragOver}
            onFileChange={setFile}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onUpload={handleUpload}
            fileInputRef={fileInputRef}
          />
          <StatCard
            label="Total Value"
            value={total}
            dataKey={metricKey}
            pill="∑ Sum"
            pillClass="stat-pill-blue"
            numericKeys={numericKeys}
            onKeyChange={setMetricKey}
          />
          <StatCard
            label="Average Value"
            value={average}
            dataKey={metricKey}
            pill="⌀ Mean"
            pillClass="stat-pill-violet"
          />
        </div>

        {/* Row count badge */}
        {rows > 0 && (
          <div style={{ marginBottom: "16px" }}>
            <span className="rows-badge">● {rows} rows loaded</span>
          </div>
        )}

        {/* Data table */}
        <DataTable
          headers={headers}
          filteredData={pageData}
          search={search}
          onSearch={setSearch}
          page={safePage}
          totalPages={totalPages}
          onPageChange={setPage}
        />

        {/* Chart — chartRef lets exportPDF grab the canvas directly */}
        <div className="dash-card chart-card" ref={chartRef}>
          <p className="card-label">Data Visualization</p>
          <ChartDisplay rows={data} />
        </div>

      </div>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
