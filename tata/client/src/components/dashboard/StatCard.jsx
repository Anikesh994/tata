const StatCard = ({ label, value, dataKey, pill, pillClass, numericKeys, onKeyChange }) => (
  <div className="dash-card stat-card">
    <p className="card-label">{label}</p>
    <div className="stat-value">{value}</div>
    {numericKeys && numericKeys.length > 1 ? (
      <select
        className="stat-key-select"
        value={dataKey}
        onChange={(e) => onKeyChange(e.target.value)}
      >
        {numericKeys.map((k) => (
          <option key={k} value={k}>{k}</option>
        ))}
      </select>
    ) : (
      <p className="stat-key">{dataKey || "No data"}</p>
    )}
    <span className={`stat-pill ${pillClass}`}>{pill}</span>
  </div>
);

export default StatCard;
