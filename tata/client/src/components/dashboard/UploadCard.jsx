const UploadCard = ({
  file, uploading, dragOver,
  onFileChange, onDragOver, onDragLeave, onDrop,
  onUpload, fileInputRef,
}) => (
  <div className="dash-card">
    <p className="card-label">Upload Data</p>
    <div
      className={`drop-zone${dragOver ? " drop-zone-active" : ""}`}
      onClick={() => fileInputRef.current?.click()}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
    >
      <span className="drop-icon">📂</span>
      <p className="drop-text"><strong>Click to browse</strong> or drag &amp; drop</p>
      <p className="drop-hint">Supports .csv files only</p>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        style={{ display: "none" }}
        onChange={(e) => onFileChange(e.target.files[0])}
      />
    </div>
    {file && (
      <div className="file-pill">
        <span>📄</span>
        <span className="file-pill-name">{file.name}</span>
      </div>
    )}
    <button
      className={`upload-btn${uploading ? " upload-btn-loading" : ""}`}
      onClick={onUpload}
      disabled={!file || uploading}
    >
      {uploading
        ? <><span className="spinner" /> Uploading...</>
        : <><span>⬆</span> Upload CSV</>
      }
    </button>
  </div>
);

export default UploadCard;
