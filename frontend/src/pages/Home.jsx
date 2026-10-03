import { Link } from "react-router-dom";
import "./Home.css";

import TechText from "../components/TechText";
/* ─── SVG Icons ──────────────────────────────────────────── */

function UploadIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3 13v3a1 1 0 001 1h12a1 1 0 001-1v-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M10 3v10M7 6l3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function ScanIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="13" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="2" y="13" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M13 15.5h4M15.5 13v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="10" y1="2" x2="10" y2="18" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2"/>
      <line x1="2" y1="10" x2="18" y2="10" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2"/>
    </svg>
  );
}

function RulerIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="1" y="6" width="18" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <line x1="5" y1="6" x2="5" y2="9.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/>
      <line x1="10" y1="6" x2="10" y2="11" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/>
      <line x1="15" y1="6" x2="15" y2="9.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/>
      <line x1="7.5" y1="6" x2="7.5" y2="8" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
      <line x1="12.5" y1="6" x2="12.5" y2="8" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  );
}

function LayersIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 2L2 6.5l8 4.5 8-4.5L10 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M2 10.5l8 4.5 8-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 14.5l8 4.5 8-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function ArrowRightIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function ChevronRightIcon({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/* ─── Measurement visual mockup ──────────────────────────── */

function MeasurementPreview() {
  return (
    <div className="home-preview-wrap">
      {/* "Screenshot" container */}
      <div className="home-preview-chrome">
        <div className="home-preview-chrome-bar">
          <span className="home-preview-dot" style={{ background: "#F0A0A0" }} />
          <span className="home-preview-dot" style={{ background: "#F5D080" }} />
          <span className="home-preview-dot" style={{ background: "#90D0A0" }} />
          <span className="home-preview-chrome-label">SmartMeasure — AI Estimate</span>
        </div>

        <div className="home-preview-canvas">
          {/* Simulated image with object silhouette */}
          <div className="home-preview-img-area">
            {/* Chair silhouette using SVG */}
            <svg
              className="home-preview-object"
              viewBox="0 0 160 200"
              fill="none"
              aria-label="Chair silhouette with measurement overlay"
            >
              {/* Chair legs */}
              <rect x="28" y="135" width="10" height="55" rx="3" fill="#B8C4C0" />
              <rect x="122" y="135" width="10" height="55" rx="3" fill="#B8C4C0" />
              <rect x="35" y="155" width="10" height="35" rx="3" fill="#B8C4C0" />
              <rect x="115" y="155" width="10" height="35" rx="3" fill="#B8C4C0" />
              {/* Seat */}
              <rect x="22" y="120" width="116" height="20" rx="4" fill="#C8D4CF" />
              {/* Backrest */}
              <rect x="30" y="50" width="100" height="72" rx="6" fill="#D4DDD9" />
              {/* Backrest detail */}
              <rect x="40" y="62" width="80" height="8" rx="3" fill="#C0CCC8" opacity="0.7" />
              <rect x="40" y="78" width="80" height="8" rx="3" fill="#C0CCC8" opacity="0.7" />
              <rect x="40" y="94" width="60" height="8" rx="3" fill="#C0CCC8" opacity="0.7" />

              {/* Bounding box — teal */}
              <rect x="18" y="44" width="124" height="148" rx="3"
                stroke="#1A8C6E" strokeWidth="1.5" strokeDasharray="5 3" fill="none" opacity="0.9" />

              {/* Width arrow (bottom) */}
              <line x1="18" y1="202" x2="142" y2="202" stroke="#1A8C6E" strokeWidth="1" />
              <path d="M22 199l-4 3 4 3" stroke="#1A8C6E" strokeWidth="1" fill="none" strokeLinecap="round" />
              <path d="M138 199l4 3-4 3" stroke="#1A8C6E" strokeWidth="1" fill="none" strokeLinecap="round" />

              {/* Height arrow (right) */}
              <line x1="152" y1="44" x2="152" y2="192" stroke="#1A8C6E" strokeWidth="1" />
              <path d="M149 48l3-4 3 4" stroke="#1A8C6E" strokeWidth="1" fill="none" strokeLinecap="round" />
              <path d="M149 188l3 4 3-4" stroke="#1A8C6E" strokeWidth="1" fill="none" strokeLinecap="round" />

              {/* Corner reference points */}
              <circle cx="18" cy="44" r="3" fill="#1A8C6E" />
              <circle cx="142" cy="44" r="3" fill="#1A8C6E" />
              <circle cx="18" cy="192" r="3" fill="#1A8C6E" />
              <circle cx="142" cy="192" r="3" fill="#1A8C6E" />
            </svg>

            {/* Object label */}
            <div className="home-preview-obj-label">
              <span className="home-preview-label-dot" />
              Object detected: chair
            </div>
          </div>

          {/* Sidebar results */}
          <div className="home-preview-sidebar">
            <div className="home-preview-sidebar-section">
              <div className="home-preview-sidebar-title">OBJECT</div>
              <div className="home-preview-sidebar-object">Chair</div>
            </div>

            <div className="home-preview-sidebar-section">
              <div className="home-preview-sidebar-title">DIMENSIONS — ESTIMATE</div>
              <div className="home-preview-dim">
                <span className="home-preview-dim-label">Width</span>
                <span className="home-preview-dim-value">52 cm</span>
              </div>
              <div className="home-preview-dim">
                <span className="home-preview-dim-label">Height</span>
                <span className="home-preview-dim-value">84 cm</span>
              </div>
              <div className="home-preview-dim">
                <span className="home-preview-dim-label">Depth</span>
                <span className="home-preview-dim-value">48 cm</span>
              </div>
            </div>

            <div className="home-preview-sidebar-section">
              <div className="home-preview-sidebar-title">CONFIDENCE</div>
              <div className="home-preview-conf">Medium</div>
            </div>

            <div className="home-preview-disclaimer">
              Example result — demonstration only
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Process step ───────────────────────────────────────── */

function ProcessStep({ num, title, desc, last }) {
  return (
    <div className="home-process-step">
      <div className="home-process-step-num">{num}</div>
      <div className="home-process-step-content">
        <div className="home-process-step-title">{title}</div>
        <div className="home-process-step-desc">{desc}</div>
      </div>
      {!last && (
        <div className="home-process-arrow" aria-hidden="true">
          <ChevronRightIcon size={14} />
        </div>
      )}
    </div>
  );
}

/* ─── Pipeline node ──────────────────────────────────────── */

function PipelineNode({ label, sub, accent }) {
  return (
    <div className={`home-pipeline-node${accent ? " home-pipeline-node-accent" : ""}`}>
      <div className="home-pipeline-node-label">{label}</div>
      {sub && <div className="home-pipeline-node-sub">{sub}</div>}
    </div>
  );
}

/* ─── Main Home component ────────────────────────────────── */

export default function Home() {
  return (
    <div>
      {/* ── HERO ── */}
      <section className="home-hero">
        <div className="home-hero-inner">
          <div className="home-hero-left">
            <div className="home-techtext">
              <TechText
                text="SmartMeasure"
                fontWeight={700}
                fontSize={96}
                letterSpacing={-0.04}
                color="#1A2420"
                accentColor="#1A8C6E"
                reach={140}
              />
            </div>

            <div className="home-eyebrow">
              COMPUTER VISION · DIMENSION ESTIMATION
            </div>

            <h1 className="home-heading">
              Measure objects<br />from a photo.
            </h1>

            <p className="home-desc">
              Estimate real-world object dimensions from a single image.
              Use AI estimation for convenience, or place a reference marker
              when measurement accuracy matters.
            </p>

            <div className="home-cta-row">
              <Link to="/estimate" className="sm-btn sm-btn-primary sm-btn-lg">
                <UploadIcon size={16} />
                Start AI Estimate
              </Link>
              <Link to="/precision" className="sm-btn sm-btn-outline sm-btn-lg">
                <RulerIcon size={16} />
                Use Precision Mode
              </Link>
            </div>

            <div className="home-hero-note">
              No account required. No data is stored.
            </div>
          </div>

          <div className="home-hero-right">
            <MeasurementPreview />
          </div>
        </div>
      </section>

      {/* ── MODE SELECTION ── */}
      <section className="home-section">
        <div className="sm-container">
          <div className="home-section-header">
            <h2 className="home-section-title">Two measurement modes</h2>
            <p className="home-section-sub">
              Choose the approach that matches your use case.
            </p>
          </div>

          <div className="home-modes-grid">
            {/* AI Estimate */}
            <div className="home-mode-card home-mode-card-ai">
              <div className="home-mode-card-head">
                <div className="home-mode-icon home-mode-icon-ai">
                  <LayersIcon size={20} />
                </div>
                <div>
                  <div className="home-mode-badge">No reference marker</div>
                  <h3 className="home-mode-title">AI Estimate</h3>
                </div>
              </div>

              <p className="home-mode-desc">
                Upload an ordinary image and let the computer-vision pipeline
                estimate object dimensions. No printed marker required.
              </p>

              <div className="home-mode-flow">
                <span className="home-mode-step">Upload image</span>
                <ChevronRightIcon />
                <span className="home-mode-step">Detect object</span>
                <ChevronRightIcon />
                <span className="home-mode-step">Estimate depth</span>
                <ChevronRightIcon />
                <span className="home-mode-step">Calculate dimensions</span>
              </div>

              <ul className="home-mode-features">
                <li>Object segmentation (YOLOv8)</li>
                <li>Monocular depth estimation</li>
                <li>Camera geometry from EXIF</li>
                <li>Size priors for known object classes</li>
                <li>Confidence range on each measurement</li>
              </ul>

              <Link to="/estimate" className="sm-btn sm-btn-ghost sm-mt-16">
                Open AI Estimate
                <ArrowRightIcon />
              </Link>
            </div>

            {/* Precision Mode */}
            <div className="home-mode-card home-mode-card-precision">
              <div className="home-mode-card-head">
                <div className="home-mode-icon home-mode-icon-precision">
                  <RulerIcon size={20} />
                </div>
                <div>
                  <div className="home-mode-badge home-mode-badge-neutral">Reference-based</div>
                  <h3 className="home-mode-title">Precision Mode</h3>
                </div>
              </div>

              <p className="home-mode-desc">
                Place a known ArUco marker in the image to establish physical
                scale and improve measurement accuracy. Click two points to
                measure any distance on the same plane.
              </p>

              <div className="home-mode-flow">
                <span className="home-mode-step">ArUco marker</span>
                <ChevronRightIcon />
                <span className="home-mode-step">Detect geometry</span>
                <ChevronRightIcon />
                <span className="home-mode-step">Correct perspective</span>
                <ChevronRightIcon />
                <span className="home-mode-step">Measure</span>
              </div>

              <ul className="home-mode-features">
                <li>ArUco marker detection (DICT_4X4_50)</li>
                <li>Known physical scale from printed marker</li>
                <li>Homography for perspective correction</li>
                <li>Click-to-measure on any plane</li>
                <li>Typical accuracy: ±1–3 cm</li>
              </ul>

              <Link to="/precision" className="sm-btn sm-btn-outline sm-mt-16">
                Open Precision Mode
                <ArrowRightIcon />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="home-section home-section-alt">
        <div className="sm-container">
          <div className="home-section-header">
            <h2 className="home-section-title">How SmartMeasure works</h2>
            <p className="home-section-sub">Three steps from photo to measurement.</p>
          </div>

          <div className="home-process">
            <ProcessStep
              num="01"
              title="Upload"
              desc="Choose an image containing the object you want to measure. For Precision Mode, ensure the printed ArUco marker is visible in the same frame."
            />
            <ProcessStep
              num="02"
              title="Analyze"
              desc="SmartMeasure detects the object, estimates depth, and establishes physical scale — either from depth priors or from the reference marker."
            />
            <ProcessStep
              num="03"
              title="Measure"
              desc="The system returns estimated dimensions and, for AI Estimate, a confidence range to communicate measurement uncertainty."
              last
            />
          </div>
        </div>
      </section>

      {/* ── PIPELINE ── */}
      <section className="home-section">
        <div className="sm-container">
          <div className="home-section-header">
            <h2 className="home-section-title">Inside the pipeline</h2>
            <p className="home-section-sub">What happens between image upload and dimension output.</p>
          </div>

          <div className="home-pipeline">
            <PipelineNode label="IMAGE INPUT" sub="JPEG / PNG / WEBP" />
            <div className="home-pipeline-arrow" aria-hidden="true" />
            <PipelineNode label="OBJECT DETECTION" sub="YOLOv8-seg" />
            <div className="home-pipeline-arrow" aria-hidden="true" />
            <PipelineNode label="SEGMENTATION" sub="Pixel-level mask" />
            <div className="home-pipeline-arrow" aria-hidden="true" />
            <PipelineNode label="DEPTH / SCALE" sub="Depth Anything V2 · ArUco" accent />
            <div className="home-pipeline-arrow" aria-hidden="true" />
            <PipelineNode label="DIMENSIONS" sub="cm · confidence range" accent />
          </div>

          <div className="home-pipeline-note">
            AI Estimate uses depth estimation + size priors.
            Precision Mode uses ArUco marker geometry + homography.
          </div>
        </div>
      </section>

      {/* ── SAMPLE RESULT ── */}
      <section className="home-section home-section-alt">
        <div className="sm-container">
          <div className="home-section-header">
            <h2 className="home-section-title">Sample result</h2>
            <p className="home-section-sub">
              Example output from AI Estimate mode. <strong>Demonstration data only</strong> — not from a real measurement.
            </p>
          </div>

          <div className="home-sample">
            <div className="home-sample-img">
              {/* Chair silhouette with overlays */}
              <div className="home-sample-img-inner">
                <svg viewBox="0 0 260 300" fill="none" style={{ width: "100%", height: "100%" }}
                  aria-label="Sample chair measurement with bounding box overlay">
                  {/* Background */}
                  <rect width="260" height="300" fill="#EEF2F1" />
                  {/* Shadow */}
                  <ellipse cx="130" cy="290" rx="80" ry="8" fill="#D8E0DE" opacity="0.6" />
                  {/* Chair legs */}
                  <rect x="52" y="198" width="14" height="80" rx="4" fill="#A8B8B0" />
                  <rect x="194" y="198" width="14" height="80" rx="4" fill="#A8B8B0" />
                  <rect x="58" y="228" width="14" height="50" rx="4" fill="#A8B8B0" />
                  <rect x="188" y="228" width="14" height="50" rx="4" fill="#A8B8B0" />
                  {/* Seat */}
                  <rect x="44" y="180" width="172" height="24" rx="6" fill="#B8C8C0" />
                  {/* Backrest */}
                  <rect x="54" y="72" width="152" height="112" rx="8" fill="#C4D0CA" />
                  <rect x="68" y="90" width="124" height="10" rx="4" fill="#B0BEB8" opacity="0.8" />
                  <rect x="68" y="108" width="124" height="10" rx="4" fill="#B0BEB8" opacity="0.8" />
                  <rect x="68" y="126" width="96" height="10" rx="4" fill="#B0BEB8" opacity="0.8" />
                  {/* Bounding box */}
                  <rect x="36" y="64" width="188" height="218" rx="4"
                    stroke="#1A8C6E" strokeWidth="2" strokeDasharray="7 4" fill="none" />
                  {/* Corner marks */}
                  <circle cx="36" cy="64" r="4" fill="#1A8C6E" />
                  <circle cx="224" cy="64" r="4" fill="#1A8C6E" />
                  <circle cx="36" cy="282" r="4" fill="#1A8C6E" />
                  <circle cx="224" cy="282" r="4" fill="#1A8C6E" />
                  {/* Width arrow */}
                  <line x1="36" y1="296" x2="224" y2="296" stroke="#1A8C6E" strokeWidth="1.5" />
                  <path d="M40 293l-4 3 4 3" stroke="#1A8C6E" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                  <path d="M220 293l4 3-4 3" stroke="#1A8C6E" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                  {/* Height arrow */}
                  <line x1="240" y1="64" x2="240" y2="282" stroke="#1A8C6E" strokeWidth="1.5" />
                  <path d="M237 68l3-4 3 4" stroke="#1A8C6E" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                  <path d="M237 278l3 4 3-4" stroke="#1A8C6E" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                </svg>

                <div className="home-sample-overlay-label">
                  Object detected — 1 of 1
                </div>
              </div>
            </div>

            <div className="home-sample-results">
              <div className="home-sample-header">
                <span className="sm-label sm-label-outline">Example result</span>
                <span className="home-sample-mode-badge">AI Estimate</span>
              </div>

              <div className="home-sample-object-row">
                <span className="home-sample-meta-label">OBJECT</span>
                <span className="home-sample-object-name">Chair</span>
              </div>

              <div className="home-sample-dims-label">ESTIMATED DIMENSIONS</div>

              <div className="home-sample-dim">
                <span className="home-sample-dim-name">Width</span>
                <div>
                  <span className="home-sample-dim-value">52 cm</span>
                  <span className="home-sample-dim-range">range 46–58 cm</span>
                </div>
                <span className="sm-confidence sm-conf-medium">medium</span>
              </div>

              <div className="home-sample-dim">
                <span className="home-sample-dim-name">Height</span>
                <div>
                  <span className="home-sample-dim-value">84 cm</span>
                  <span className="home-sample-dim-range">range 78–91 cm</span>
                </div>
                <span className="sm-confidence sm-conf-high">high</span>
              </div>

              <div className="home-sample-dim">
                <span className="home-sample-dim-name">Depth</span>
                <div>
                  <span className="home-sample-dim-value">48 cm</span>
                  <span className="home-sample-dim-range">range 39–57 cm</span>
                </div>
                <span className="sm-confidence sm-conf-low">low</span>
              </div>

              <div className="home-sample-note">
                These values are demonstration data. Actual results depend on image quality,
                camera angle, and object geometry.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ACCURACY / LIMITATIONS ── */}
      <section className="home-section">
        <div className="sm-container">
          <div className="home-limitations">
            <div className="home-limitations-left">
              <h2 className="home-section-title">Accuracy and limitations</h2>
              <p className="home-section-sub">
                Image-based measurements depend on camera angle, object geometry,
                image quality, and the available reference information.
              </p>
            </div>

            <div className="home-limitations-right">
              <div className="home-lim-row">
                <div className="home-lim-mode">
                  <span className="sm-label sm-label-teal">AI Estimate</span>
                </div>
                <p className="home-lim-desc">
                  Approximate measurement. Typical error: 10–30%.
                  Accuracy depends on EXIF focal-length data, object class, and image framing.
                  Always reported with a confidence range.
                </p>
              </div>
              <div className="home-lim-row">
                <div className="home-lim-mode">
                  <span className="sm-label sm-label-neutral">Precision Mode</span>
                </div>
                <p className="home-lim-desc">
                  Reference-based measurement. Typical accuracy: ±1–3 cm.
                  Requires printed marker on the same plane as the measurement target.
                </p>
              </div>

              <div className="home-lim-footer-note">
                SmartMeasure is a research/portfolio project, not a certified measuring instrument.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── UNDER THE HOOD ── */}
      <section className="home-section home-section-alt">
        <div className="sm-container">
          <div className="home-section-header">
            <h2 className="home-section-title">Under the hood</h2>
            <p className="home-section-sub">Technologies and techniques used in SmartMeasure.</p>
          </div>

          <div className="home-tech-grid">
            {[
              { label: "Object Detection", sub: "YOLOv8 (Ultralytics)" },
              { label: "Image Segmentation", sub: "Pixel-level object masks" },
              { label: "Depth Estimation", sub: "Depth Anything V2 Metric" },
              { label: "ArUco Markers", sub: "DICT_4X4_50" },
              { label: "Homography", sub: "OpenCV findHomography" },
              { label: "Perspective Correction", sub: "4-point transform" },
              { label: "Pixel-to-Real Conversion", sub: "Focal length · depth · scale" },
              { label: "EXIF Parsing", sub: "Focal length extraction" },
            ].map((t) => (
              <div key={t.label} className="home-tech-item">
                <div className="home-tech-item-label">{t.label}</div>
                <div className="home-tech-item-sub">{t.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BAR ── */}
      <section className="home-cta-bar">
        <div className="sm-container">
          <div className="home-cta-bar-inner">
            <div>
              <div className="home-cta-bar-title">Ready to measure?</div>
              <div className="home-cta-bar-sub">
                Upload an image and get dimension estimates in seconds.
              </div>
            </div>
            <div className="home-cta-bar-actions">
              <Link to="/estimate" className="sm-btn sm-btn-primary">
                <UploadIcon size={15} />
                Start AI Estimate
              </Link>
              <Link to="/precision" className="sm-btn sm-btn-outline">
                <RulerIcon size={15} />
                Use Precision Mode
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
