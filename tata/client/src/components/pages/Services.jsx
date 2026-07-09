import { Link } from "react-router-dom";
import Navbar from "../Navbar";
import "./Services.css";

const services = [
  { emoji: "📤", title: "CSV Upload",
    desc: "Drag and drop or browse to upload any CSV file. Data is parsed and stored instantly." },
  { emoji: "📊", title: "Interactive Tables",
    desc: "Browse your data in a sortable, searchable table. Filter rows in real time." },
  { emoji: "📈", title: "Dynamic Charts",
    desc: "Bar, Line, and Doughnut charts. Pick any column as X or Y axis." },
  { emoji: "🧮", title: "Auto Analytics",
    desc: "Totals, averages, and row counts computed automatically — no formulas needed." },
  { emoji: "📑", title: "PDF Export",
    desc: "Export your entire dashboard to a clean, shareable PDF in one click." },
  { emoji: "🔒", title: "Secure Auth",
    desc: "Clerk-powered authentication keeps your datasets private and secure." },
];

const Services = () => (
  <div className="services-page">
    <Navbar />

    {/* Hero */}
    <div className="services-hero">
      <span className="services-eyebrow">Features</span>
      <h1 className="services-title">
        Everything InsightBoard <span className="services-title-gradient">can do.</span>
      </h1>
      <p className="services-subtitle">
        A full-stack analytics platform built to turn raw CSV files into meaningful
        visual insights — with zero configuration.
      </p>
    </div>

    {/* Grid */}
    <div className="services-grid-wrap">
      <div className="services-grid">
        {services.map((s, i) => (
          <div key={s.title} className={`service-card service-card-${i + 1}`}>
            <div className="service-icon">{s.emoji}</div>
            <h3 className="service-name">{s.title}</h3>
            <p className="service-desc">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>

    {/* CTA */}
    <div className="services-cta-wrap">
      <div className="services-cta-box">
        <div className="services-cta-glow" />
        <h2 className="services-cta-title">Ready to explore your data?</h2>
        <p className="services-cta-sub">Upload a CSV and get insights in seconds.</p>
        <Link to="/dashboard" className="services-cta-btn">
          Open Dashboard
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 7l5 5m0 0l-5 5m5-5H6"/>
          </svg>
        </Link>
      </div>
    </div>
  </div>
);

export default Services;
