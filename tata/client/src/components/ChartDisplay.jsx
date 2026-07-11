import { useState, useEffect, useMemo } from "react";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler,
} from "chart.js";
import "./ChartDisplay.css";

ChartJS.register(
  CategoryScale, LinearScale, BarElement,
  PointElement, LineElement, ArcElement,
  Title, Tooltip, Legend, Filler
);

const PALETTE = ["#38bdf8","#818cf8","#f472b6","#2dd4bf","#fb923c","#a3e635","#e879f9","#34d399"];

/** Derive sensible default keys from a row array */
function getDefaultKeys(rows) {
  if (!rows.length) return { xKey: "", yKey: "" };
  const keys = Object.keys(rows[0]);
  const xKey = keys[0];
  let yKey = keys[1] || keys[0];
  for (const k of keys) {
    if (!isNaN(parseFloat(rows[0][k]))) { yKey = k; break; }
  }
  return { xKey, yKey };
}

const ChartDisplay = ({ rows = [] }) => {
  // Initialise keys immediately from rows so first render is never blank
  const [xKey,      setXKey]      = useState(() => getDefaultKeys(rows).xKey);
  const [yKey,      setYKey]      = useState(() => getDefaultKeys(rows).yKey);
  const [chartType, setChartType] = useState("bar");

  // Reset keys whenever a NEW dataset arrives (upload)
  useEffect(() => {
    const { xKey: x, yKey: y } = getDefaultKeys(rows);
    setXKey(x);
    setYKey(y);
  }, [rows]);

  const keys = rows.length ? Object.keys(rows[0]) : [];

  // Memoise chart data so it only rebuilds when inputs change
  const chartData = useMemo(() => {
    if (!rows.length || !xKey || !yKey) return null;

    const isDoughnut = chartType === "pie";
    const values = rows.map((r) => parseFloat(r[yKey]) || 0);
    const labels = rows.map((r) => String(r[xKey] ?? "—"));

    return {
      labels,
      datasets: [{
        label: yKey,
        data:  values,
        backgroundColor: isDoughnut
          ? PALETTE.slice(0, values.length)
          : "rgba(56, 189, 248, 0.75)",
        borderColor: isDoughnut
          ? PALETTE.slice(0, values.length).map((c) => c + "bb")
          : "#38bdf8",
        borderWidth:  isDoughnut ? 2 : 1.5,
        borderRadius: chartType === "bar" ? 6 : 0,
        fill:    chartType === "line"
          ? { target: "origin", above: "rgba(56,189,248,0.12)" }
          : false,
        tension: 0.4,
        pointBackgroundColor:      "#38bdf8",
        pointBorderColor:          "#080b14",
        pointBorderWidth:          2,
        pointRadius:               4,
        pointHoverRadius:          7,
        pointHoverBackgroundColor: "#f8fafc",
      }],
    };
  }, [rows, xKey, yKey, chartType]);

  const baseOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 450 },
    plugins: {
      legend: {
        labels: {
          color: "#64748b",
          font:  { family: "Inter", size: 12 },
          usePointStyle: true,
          padding: 20,
          boxWidth: 8,
          boxHeight: 8,
        },
      },
      tooltip: {
        backgroundColor: "rgba(8,14,32,0.96)",
        borderColor:     "rgba(255,255,255,0.08)",
        borderWidth:     1,
        titleColor:      "#f8fafc",
        bodyColor:       "#94a3b8",
        padding:         12,
        cornerRadius:    10,
        titleFont: { family: "Inter", size: 13, weight: "600" },
        bodyFont:  { family: "Inter", size: 12 },
        callbacks: { label: (ctx) => `  ${ctx.dataset.label}: ${ctx.formattedValue}` },
      },
    },
  }), []);

  const axisOptions = useMemo(() => ({
    ...baseOptions,
    scales: {
      x: {
        ticks:  { color: "#475569", font: { family: "Inter", size: 11 }, maxTicksLimit: 14, maxRotation: 45 },
        grid:   { color: "rgba(255,255,255,0.04)" },
        border: { color: "rgba(255,255,255,0.04)" },
      },
      y: {
        ticks:       { color: "#475569", font: { family: "Inter", size: 11 } },
        grid:        { color: "rgba(255,255,255,0.04)" },
        border:      { color: "rgba(255,255,255,0.04)" },
        beginAtZero: true,
      },
    },
  }), [baseOptions]);

  // ── Empty state ──────────────────────────────────────────
  if (!rows.length) {
    return (
      <div className="chart-empty-state">
        <span className="chart-empty-icon">📊</span>
        <p>Upload a CSV file to see your chart here.</p>
      </div>
    );
  }

  // Guard: keys not ready yet (should be instant with lazy init, but just in case)
  if (!chartData) return null;

  return (
    <div className="chart-wrapper">

      {/* ── Controls ── */}
      <div className="chart-controls">
        {[
          { label: "X Axis",           val: xKey,      set: setXKey,  opts: keys },
          { label: "Y Axis (numeric)", val: yKey,      set: setYKey,  opts: keys },
          {
            label: "Chart Type", val: chartType, set: setChartType,
            opts: [
              { v: "bar",  l: "Bar Chart"      },
              { v: "line", l: "Line Chart"     },
              { v: "pie",  l: "Doughnut Chart" },
            ],
          },
        ].map(({ label, val, set, opts }) => (
          <div key={label} className="chart-control-group">
            <label className="chart-control-label">{label}</label>
            <select
              value={val}
              onChange={(e) => set(e.target.value)}
              className="chart-select"
            >
              {opts.map((o) =>
                typeof o === "string"
                  ? <option key={o}   value={o}  >{o}  </option>
                  : <option key={o.v} value={o.v}>{o.l}</option>
              )}
            </select>
          </div>
        ))}
      </div>

      {/* ── Canvas ── height set inline so Chart.js always has a container size */}
      <div className="chart-canvas-wrap">
        {chartType === "bar"  && <Bar      data={chartData} options={axisOptions} />}
        {chartType === "line" && <Line     data={chartData} options={axisOptions} />}
        {chartType === "pie"  && <Doughnut data={chartData} options={baseOptions} />}
      </div>

    </div>
  );
};

export default ChartDisplay;
