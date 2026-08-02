import { Link } from "react-router-dom";
import Navbar from "../Navbar";
import { Show, SignUpButton } from "@clerk/react";
import dashboardImg from "../../../libs/image.png";
import "./Home.css";

const features = [
  { icon: "📤", title: "CSV Upload",         desc: "Drag and drop any CSV. Parsed and ready in seconds." },
  { icon: "📊", title: "Interactive Tables", desc: "Searchable, sortable tables with real-time filtering." },
  { icon: "📈", title: "Live Charts",        desc: "Bar, line and doughnut charts — pick any column." },
  { icon: "🧮", title: "Auto Analytics",     desc: "Totals, averages and row counts, computed instantly." },
  { icon: "📑", title: "PDF Export",         desc: "One-click export of your full dashboard to PDF." },
  { icon: "🔒", title: "Secure Auth",        desc: "Clerk-powered login keeps your data private." },
];

const stats = [
  { value: "∞",       label: "CSV Files",   icon: "📁" },
  { value: "3",       label: "Chart Types", icon: "📈" },
  { value: "1-click", label: "PDF Export",  icon: "📑" },
];

const Home = () => (
  /* Root — clips everything, no scroll leak */
  <div className="home-root">

    <Navbar />

    {/* ══════════════════════════════════════════
        HERO — split: image left, text right
    ══════════════════════════════════════════ */}
    <section className="home-hero">

      {/* Ambient orbs */}
      <div className="hero-orb hero-orb-1" />
      <div className="hero-orb hero-orb-2" />
      <div className="hero-orb hero-orb-3" />

      <div className="hero-split">

        {/* ── LEFT: headline + CTAs ── */}
        <div className="hero-text-col">

          <div className="hero-badge animate-fade-up">
            <span className="badge-dot" />
            <span>InsightBoard · Built for Tata Motors</span>
          </div>

          <h1 className="hero-headline animate-fade-up-1">
            Turn your data into{" "}
            <span className="gradient-word">stunning insights.</span>
          </h1>

          <p className="hero-sub animate-fade-up-2">
            Upload any CSV, explore interactive charts, and export polished
            reports — all in one beautiful workspace.
          </p>

          <div className="hero-cta animate-fade-up-3">
            <Link to="/dashboard" className="btn-primary">
              Open Dashboard
              <svg className="btn-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Show when="signed-out">
              <SignUpButton mode="modal">
                <button className="btn-secondary">Create Free Account</button>
              </SignUpButton>
            </Show>
            <Link to="/services" className="btn-secondary">View Features</Link>
          </div>

          {/* trust row */}
          <div className="hero-trust animate-fade-up-4">
            <span className="trust-item"><span className="trust-check">✓</span> No credit card</span>
            <span className="trust-sep">·</span>
            <span className="trust-item"><span className="trust-check">✓</span> Free to start</span>
            <span className="trust-sep">·</span>
            <span className="trust-item"><span className="trust-check">✓</span> Instant setup</span>
          </div>

        </div>

        {/* ── RIGHT: real dashboard screenshot ── */}
        <div className="hero-img-col animate-fade-up">
          <div className="hero-img-glow" />
          <div className="hero-img-frame">
            <div className="hero-img-titlebar">
              <span className="dot-red" />
              <span className="dot-yellow" />
              <span className="dot-green" />
              <span className="hero-img-url">insightboard.app · dashboard</span>
            </div>
            <img
              src={dashboardImg}
              alt="InsightBoard dashboard preview"
              className="hero-img"
              draggable={false}
            />
          </div>
          {/* floating pills */}
          <div className="hero-pill hero-pill-left">
            <span className="hero-pill-icon">📊</span>
            <span>3 chart types</span>
          </div>
          <div className="hero-pill hero-pill-right">
            <span className="hero-pill-dot" />
            <span>Live analytics</span>
          </div>
        </div>

      </div>
    </section>

    {/* ══════════════════════════════════════
        STATS
    ══════════════════════════════════════ */}
    <div className="home-stats">
      <div className="stats-grid">
        {stats.map((s) => (
          <div key={s.label} className="stat-cell">
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value-text">{s.value}</div>
            <div className="stat-label-text">{s.label}</div>
          </div>
        ))}
      </div>
    </div>

    {/* ══════════════════════════════════════
        FEATURES
    ══════════════════════════════════════ */}
    <section className="home-section">
      <span className="section-eyebrow">What's inside</span>
      <h2 className="section-title-text">
        Everything you need to analyze CSV data.
      </h2>
      <div className="features-grid">
        {features.map((f) => (
          <div key={f.title} className="feature-card">
            <div className="feature-icon-box">{f.icon}</div>
            <h3 className="feature-title">{f.title}</h3>
            <p className="feature-desc">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>

    {/* ══════════════════════════════════════
        CTA STRIP
    ══════════════════════════════════════ */}
    <section className="home-section home-section-last">
      <div className="cta-strip">
        <div className="cta-glow" />
        <h2 className="section-title-text" style={{ position: "relative" }}>
          Ready to get started?
        </h2>
        <p className="cta-sub">Upload a CSV and your dashboard builds itself.</p>
        <div className="hero-cta" style={{ position: "relative" }}>
          <Link to="/dashboard" className="btn-primary">
            Launch Dashboard
            <svg className="btn-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <Link to="/services" className="btn-secondary">Explore Features</Link>
        </div>
      </div>
    </section>

  </div>
);

export default Home;
