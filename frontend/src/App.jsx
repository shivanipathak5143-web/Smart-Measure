import { Route, Routes, Link, NavLink } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Estimate from "./pages/Estimate";
import Precision from "./pages/Precision";
import HowItWorks from "./pages/HowItWorks";
import About from "./pages/About";

function FooterBrandIcon() {
  return (
    <span className="sm-footer-logo-icon">
      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <rect x="0.75" y="4.75" width="14.5" height="6.5" rx="1.25" stroke="white" strokeWidth="1.5" />
        <line x1="4" y1="4.75" x2="4" y2="7.5" stroke="white" strokeWidth="1.25" strokeLinecap="round" />
        <line x1="8" y1="4.75" x2="8" y2="8.5" stroke="white" strokeWidth="1.25" strokeLinecap="round" />
        <line x1="12" y1="4.75" x2="12" y2="7.5" stroke="white" strokeWidth="1.25" strokeLinecap="round" />
      </svg>
    </span>
  );
}

export default function App() {
  return (
    <div className="sm-root">
      <Navbar />
      <main className="sm-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/estimate" element={<Estimate />} />
          <Route path="/precision" element={<Precision />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>

      <footer className="sm-footer">
        <div className="sm-footer-inner">
          <div className="sm-footer-brand">
            <Link to="/" className="sm-footer-logo">
              <FooterBrandIcon />
              SmartMeasure
            </Link>
            <p className="sm-footer-tagline">
              Computer vision for practical dimension estimation from photographs.
            </p>
          </div>

          <nav className="sm-footer-nav" aria-label="Footer navigation">
            <span className="sm-footer-nav-label">Navigation</span>
            <Link to="/">Home</Link>
            <Link to="/estimate">AI Estimate</Link>
            <Link to="/precision">Precision Mode</Link>
            <Link to="/how-it-works">How It Works</Link>
            <Link to="/about">About</Link>
          </nav>
        </div>

        <div className="sm-footer-bottom">
          Pipeline: YOLOv8-seg · Depth Anything V2 · ArUco + homography · FastAPI + React
        </div>
      </footer>
    </div>
  );
}
