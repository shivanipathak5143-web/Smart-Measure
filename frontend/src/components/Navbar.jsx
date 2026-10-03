import { useState } from "react";
import { NavLink, Link } from "react-router-dom";

const LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/estimate", label: "AI Estimate" },
  { to: "/precision", label: "Precision Mode" },
  { to: "/how-it-works", label: "How It Works" },
  { to: "/about", label: "About" },
];

function RulerIcon({ size = 16, color = "currentColor" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <rect x="0.75" y="4.75" width="14.5" height="6.5" rx="1.25" stroke={color} strokeWidth="1.5" />
      <line x1="4" y1="4.75" x2="4" y2="7.5" stroke={color} strokeWidth="1.25" strokeLinecap="round" />
      <line x1="8" y1="4.75" x2="8" y2="8.5" stroke={color} strokeWidth="1.25" strokeLinecap="round" />
      <line x1="12" y1="4.75" x2="12" y2="7.5" stroke={color} strokeWidth="1.25" strokeLinecap="round" />
      <line x1="6" y1="4.75" x2="6" y2="6.25" stroke={color} strokeWidth="1" strokeLinecap="round" />
      <line x1="10" y1="4.75" x2="10" y2="6.25" stroke={color} strokeWidth="1" strokeLinecap="round" />
      <line x1="14" y1="4.75" x2="14" y2="6.25" stroke={color} strokeWidth="1" strokeLinecap="round" />
      <line x1="2" y1="4.75" x2="2" y2="6.25" stroke={color} strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <line x1="2" y1="4.5" x2="16" y2="4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="2" y1="9" x2="16" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="2" y1="13.5" x2="16" y2="13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <line x1="3" y1="3" x2="15" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="15" y1="3" x2="3" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sm-navbar" role="navigation" aria-label="Main navigation">
      <div className="sm-navbar-inner">
        <NavLink to="/" className="sm-navbar-brand" end onClick={() => setOpen(false)}>
          <span className="sm-navbar-brand-icon">
            <RulerIcon size={15} color="white" />
          </span>
          <span className="sm-navbar-brand-text">
            <span className="sm-navbar-brand-name">SmartMeasure</span>
            <span className="sm-navbar-brand-sub">Computer Vision</span>
          </span>
        </NavLink>

        <div className={`sm-navbar-links${open ? " open" : ""}`}>
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                "sm-navbar-link" + (isActive ? " active" : "")
              }
              onClick={() => setOpen(false)}
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className="sm-navbar-cta">
          <Link to="/estimate" className="sm-btn sm-btn-primary sm-btn-sm">
            Start Measuring
          </Link>
        </div>

        <button
          className="sm-navbar-mobile-toggle"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>
    </nav>
  );
}
