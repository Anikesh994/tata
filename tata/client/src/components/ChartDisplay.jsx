import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import "./ChartDisplay.css"; 

ChartJS.register(BarElement, CategoryScale, LinearScale);

const ChartDisplay = () => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:5000/api/csv")
      .then(res => {
        const latest = res.data[res.data.length - 1]?.data || [];
        if (latest.length === 0) return;

        const keys = Object.keys(latest[0]);
        const labelKey = keys[0];
        const valueKey = keys[1];

        const labels = latest.map(item => item[labelKey]);
        const values = latest.map(item => parseFloat(item[valueKey]));

        setChartData({
          labels,
          datasets: [{
            label: valueKey,
            data: values,
            backgroundColor: "#38bdf8", // Tailwind skyblue
            borderRadius: 5,
            borderSkipped: false,
          }],
        });
      });
  }, []);

  const chartOptions = {
    scales: {
      x: {
        ticks: {
          color: "#ffffff", 
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)", 
        }
      },
      y: {
        ticks: {
          color: "#ffffff", 
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)", 
        }
      },
    },
    plugins: {
      legend: {
        labels: {
          color: "#ffffff", 
        },
      },
    },
  };

  return (
    <div className="chart-wrapper">
      <div className="chart-card">
        <h2 className="chart-title">CSV Bar Chart</h2>
        {chartData ? (
          <Bar data={chartData} options={chartOptions} />
        ) : (
          <p className="loading">Loading chart...</p>
        )}
      </div>
    </div>
  );
};

export default ChartDisplay;
