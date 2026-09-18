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

function isNumericColumn(rows, key) {
  const sample = rows.length > 50 ? rows.filter((_, i) => i % Math.floor(rows.length / 50) === 0).slice(0, 50) : rows;
  const nonEmpty = sample.filter((r) => r[key] !== "" && r[key] != null);
  if (!nonEmpty.length) return false;
  const numericCount = nonEmpty.filter((r) => Number.isFinite(parseFloat(r[key]))).length;
  return numericCount / nonEmpty.length >= 0.8;
}

function getDefaultKeys(rows) {
  if (!rows.length) return { xKey: "", yKey: "" };
  const keys = Object.keys(rows[0]);
  const xKey = keys[0];
  const numericKeys = keys.filter((k) => isNumericColumn(rows, k));
  const yKey = numericKeys.length ? numericKeys[0] : (keys[1] || keys[0]);
  return { xKey, yKey };
}

function aggregateRows(rows, xKey, yKey) {
  if (!rows.length) return { labels: [], values: [] };

  const numeric = isNumericColumn(rows, yKey);

  if (numeric) {
    // Group by X label and sum the Y values.
    // Duplicate X values (e.g. "Male" appearing 50 times) get merged into one bar.
    // Unique X values are kept as-is — nothing gets hidden or bucketed.
    const sums = {};
    const order = [];
    for (const r of rows) {
      const label = String(r[xKey] ?? "—");
      const val   = parseFloat(r[yKey]) || 0;
      if (!(label in sums)) { sums[label] = 0; order.push(label); }
      sums[label] += val;
    }
    return {
      labels: order,
      values: order.map((l) => sums[l]),
    };
  }

  // Non-numeric Y — count occurrences per X label
  const counts = {};
  const order  = [];
  for (const r of rows) {
    const label = String(r[xKey] ?? "—");
    if (!(label in counts)) { counts[label] = 0; order.push(label); }
    counts[label] += 1;
  }
  return {
    labels: order,
    values: order.map((l) => counts[l]),
  };
}

const ChartDisplay = ({ rows = [] }) => {
  const [xKey,      setXKey]      = useState(() => getDefaultKeys(rows).xKey);
  const [yKey,      setYKey]      = useState(() => getDefaultKeys(rows).yKey);
  const [chartType, setChartType] = useState("bar");

  useEffect(() => {
    const { xKey: x, yKey: y } = getDefaultKeys(rows);
    setXKey(x);
    setYKey(y);
  }, [rows]);

  const keys        = rows.length ? Object.keys(rows[0]) : [];
  const numericKeys = useMemo(() => keys.filter((k) => isNumericColumn(rows, k)), [rows, keys.join(",")]);

  const chartData = useMemo(() => {
    if (!rows.length || !xKey || !yKey) return null;
    const { labels, values } = aggregateRows(rows, xKey, yKey);
    if (!labels.length) return null;
    const isDoughnut = chartType === "pie";
    return {
      labels,
      datasets: [{
        label: yKey,
        data:  values,
        backgroundColor: isDoughnut
          ? PALETTE.slice(0, values.length).map((c, i) => PALETTE[i % PALETTE.length])
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
        pointRadius:               rows.length > 500 ? 0 : 4,
        pointHoverRadius:          7,
        pointHoverBackgroundColor: "#f8fafc",
      }],
    };
  }, [rows, xKey, yKey, chartType]);

  const baseOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: rows.length > 1000 ? 0 : 450 },
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
  }), [rows.length]);

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

  if (!rows.length) {
    return (
      <div className="chart-empty-state">
        <span className="chart-empty-icon">📊</span>
        <p>Upload a CSV file to see your chart here.</p>
      </div>
    );
  }

  if (!chartData) return null;

  const yAxisOpts = numericKeys.length ? numericKeys : keys;

  return (
    <div className="chart-wrapper">
      <div className="chart-controls">
        {[
          { label: "X Axis",           val: xKey,      set: setXKey,  opts: keys },
          { label: "Y Axis (numeric)", val: yKey,      set: setYKey,  opts: yAxisOpts },
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
                  ? <option key={o}   value={o}  >{o}</option>
                  : <option key={o.v} value={o.v}>{o.l}</option>
              )}
            </select>
          </div>
        ))}
      </div>

      <div className="chart-canvas-wrap">
        {chartType === "bar"  && <Bar      data={chartData} options={axisOptions} />}
        {chartType === "line" && <Line     data={chartData} options={axisOptions} />}
        {chartType === "pie"  && <Doughnut data={chartData} options={baseOptions} />}
      </div>
    </div>
  );
};

export default ChartDisplay;
