/**
 * components/exports/ExportCard.jsx
 * Single export card — renders metadata, availability badge,
 * and download / delete actions.
 *
 * Props:
 *  exp          — export record from MongoDB
 *  hasLocal     — whether the PDF is cached in IndexedDB on this device
 *  downloading  — ID of the export currently being downloaded (or null)
 *  deleting     — ID of the export currently being deleted (or null)
 *  onDownload   — (id, fileName, cloudinaryUrl) => void
 *  onDelete     — (id) => void
 */

import { formatBytes, formatDate } from "../../utils/formatters";

const ExportCard = ({ exp, hasLocal, downloading, deleting, onDownload, onDelete }) => {
  const isDownloading = downloading === exp._id;
  const isDeleting    = deleting    === exp._id;
  const canDownload   = hasLocal || !!exp.cloudinaryUrl;

  return (
    <div className="me-card">

      {/* ── Top: icon + filename + type badge ── */}
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

      {/* ── Meta: date, size, availability ── */}
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
            ? <span className="me-avail-badge me-avail-yes">● Cached locally</span>
            : exp.cloudinaryUrl
              ? <span className="me-avail-badge me-avail-yes">● Available via cloud</span>
              : <span className="me-avail-badge me-avail-no">○ Not available on this device</span>
          }
        </div>

      </div>

      {/* ── Actions: download + delete ── */}
      <div className="me-card-actions">

        <button
          className="me-download-btn"
          onClick={() => onDownload(exp._id, exp.fileName, exp.cloudinaryUrl)}
          disabled={!canDownload || isDownloading || isDeleting}
          title={canDownload ? "Download PDF" : "Not available"}
        >
          {isDownloading ? (
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
          onClick={() => onDelete(exp._id)}
          disabled={isDeleting || isDownloading}
        >
          {isDeleting ? (
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
};

export default ExportCard;
