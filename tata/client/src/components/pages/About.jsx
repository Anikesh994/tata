import Navbar from "../Navbar";
import "./About.css";

const team = [
  { name: "Anikesh",     college: "NIT Jamshedpur",      role: "Full Stack Developer", initials: "AK", color: "#38bdf8" },
  { name: "Harsh Kumar", college: "Siksha O Anusandhan", role: "Frontend Developer",   initials: "HK", color: "#818cf8" },
];

const tags = ["React 19", "Node.js", "MongoDB", "Chart.js", "Clerk Auth", "Vite"];

const About = () => (
  <div className="about-page">
    <Navbar />

    {/* Hero */}
    <div className="about-hero">
      <span className="about-eyebrow">Team 22 · Tata Motors Internship</span>
      <h1 className="about-title">
        Built by engineers,<br />
        <span className="about-title-gradient">for engineers.</span>
      </h1>
      <p className="about-subtitle">
        InsightBoard was created during our internship at Tata Motors to make
        data analysis fast, visual, and accessible for everyone.
      </p>
    </div>

    {/* Team cards */}
    <div className="about-team-wrap">
      <p className="about-section-label">The Team</p>
      <div className="about-team-grid">
        {team.map((m) => (
          <div key={m.name} className="team-card">
            <div
              className="team-avatar"
              style={{ background: `${m.color}18`, border: `1px solid ${m.color}30`, color: m.color }}
            >
              {m.initials}
            </div>
            <div className="team-info">
              <p className="team-name">{m.name}</p>
              <p className="team-role" style={{ color: m.color }}>{m.role}</p>
              <p className="team-college">{m.college}</p>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Project info */}
    <div className="about-project-wrap">
      <div className="about-project-card">
        <p className="about-section-label" style={{ color: "#38bdf8", marginBottom: "14px" }}>
          About the Project
        </p>
        <p className="about-project-text">
          InsightBoard is a full-stack data visualization platform developed as part of the
          Team 22 internship project for <strong style={{ color: "#94a3b8" }}>Tata Motors</strong>.
          It lets users upload CSV datasets, visualize them as interactive charts,
          apply real-time filters, and export dashboards as PDFs — all in a modern, responsive interface.
        </p>
        <div className="about-tags">
          {tags.map((t) => (
            <span key={t} className="about-tag">{t}</span>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default About;
