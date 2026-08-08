/**
 * components/dashboard/StatCard.jsx
 * Single analytics stat card (Total / Average).
 * Extracted from Dashboard.jsx; all CSS classes preserved.
 *
 * Props:
 *  label     — card header label (e.g. "Total Value")
 *  value     — formatted value string (e.g. "12,345.67" or "—")
 *  dataKey   — name of the column being summarised
 *  pill      — pill label (e.g. "∑ Sum")
 *  pillClass — CSS class for the pill (e.g. "stat-pill-blue")
 */

const StatCard = ({ label, value, dataKey, pill, pillClass }) => (
  <div className="dash-card stat-card">
    <p className="card-label">{label}</p>
    <div className="stat-value">{value}</div>
    <p className="stat-key">{dataKey || "No data"}</p>
    <span className={`stat-pill ${pillClass}`}>{pill}</span>
  </div>
);

export default StatCard;
