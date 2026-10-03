import { useRef, useState } from "react";
import "./Precision.css";

import LatticeLoader from "../components/LatticeLoader";
const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

/* ─── SVG Icons ─────────────────────────────────────────── */

function UploadIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3 13v3a1 1 0 001 1h12a1 1 0 001-1v-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M10 3v10M7 6l3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function AlertIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M7 1L1 12h12L7 1z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
      <line x1="7" y1="5" x2="7" y2="8.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <circle cx="7" cy="10.5" r="0.7" fill="currentColor"/>
    </svg>
  );
}

function InfoIcon({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.3"/>
      <line x1="7" y1="6" x2="7" y2="10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <circle cx="7" cy="4" r="0.7" fill="currentColor"/>
    </svg>
  );
}

function ImagePlaceholderIcon({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="30" height="26" rx="3" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="12" cy="14" r="3" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M3 25l7-7 5 5 5-5 13 9" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  );
}

/* ─── ArUco marker visual ───────────────────────────────── */

function ArUcoMarkerPreview() {
  return (
    <div className="prec-aruco-visual">
      <svg viewBox="0 0 80 80" width="80" height="80" aria-label="Example ArUco marker">
        <rect width="80" height="80" fill="white" stroke="#D8E0DE" strokeWidth="1" />
        {/* Outer black border */}
        <rect x="8" y="8" width="64" height="64" fill="black" />
        {/* Inner white */}
        <rect x="16" y="16" width="48" height="48" fill="white" />
        {/* Pattern cells */}
        <rect x="16" y="16" width="8" height="8" fill="black" />
        <rect x="32" y="16" width="8" height="8" fill="black" />
        <rect x="48" y="16" width="8" height="8" fill="black" />
        <rect x="56" y="16" width="8" height="8" fill="black" />
        <rect x="16" y="24" width="8" height="8" fill="black" />
        <rect x="40" y="24" width="8" height="8" fill="black" />
        <rect x="16" y="32" width="8" height="8" fill="black" />
        <rect x="24" y="32" width="8" height="8" fill="black" />
        <rect x="48" y="32" width="8" height="8" fill="black" />
        <rect x="24" y="40" width="8" height="8" fill="black" />
        <rect x="40" y="40" width="8" height="8" fill="black" />
        <rect x="16" y="48" width="8" height="8" fill="black" />
        <rect x="32" y="48" width="8" height="8" fill="black" />
        <rect x="48" y="48" width="8" height="8" fill="black" />
        <rect x="56" y="48" width="8" height="8" fill="black" />
        <rect x="16" y="56" width="8" height="8" fill="black" />
        <rect x="24" y="56" width="8" height="8" fill="black" />
        <rect x="40" y="56" width="8" height="8" fill="black" />
        <rect x="48" y="56" width="8" height="8" fill="black" />
        <rect x="56" y="56" width="8" height="8" fill="black" />
      </svg>
      <div className="prec-aruco-caption">DICT_4X4_50 marker</div>
    </div>
  );
}

/* ─── Precision page ────────────────────────────────────── */

export default function Precision() {
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState(null);
  const [dims, setDims] = useState({ w: 1, h: 1 });
  const [markerMm, setMarkerMm] = useState(100);
  const [points, setPoints] = useState([]);
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [drag, setDrag] = useState(false);
  const imgRef = useRef(null);
  const inputRef = useRef(null);

  function handleFile(f) {
    if (!f) return;
    setFile(f);
    setUrl(URL.createObjectURL(f));
    setPoints([]);
    setResult(null);
    setError("");
    setStatus("idle");
  }

  function onFile(e) { handleFile(e.target.files[0]); }

  function onDrop(e) {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith("image/")) handleFile(f);
  }

  function onImageClick(e) {
    const img = imgRef.current;
    const r = img.getBoundingClientRect();
    const x = ((e.clientX - r.left) * img.naturalWidth) / r.width;
    const y = ((e.clientY - r.top) * img.naturalHeight) / r.height;
    setPoints((p) => [...p, [x, y]]);
  }

  async function run() {
    setError("");
    setResult(null);
    const segments = [];
    for (let i = 0; i + 1 < points.length; i += 2) {
      segments.push({ label: `Measurement ${i / 2 + 1}`, p1: points[i], p2: points[i + 1] });
    }
    if (!file) { setError("Upload a photo first."); return; }
    if (segments.length === 0) {
      setError("Click two points on the image to define a measurement.");
      return;
    }
    setStatus("working");
    const form = new FormData();
    form.append("file", file);
    form.append("marker_size_mm", String(markerMm));
    form.append("segments", JSON.stringify(segments));
    try {
      const res = await fetch(`${API}/api/measure`, { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Request failed");
      setResult(data);
      setStatus("done");
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  }

  const working = status === "working";
  const pairCount = Math.floor(points.length / 2);
  const pendingPoint = points.length % 2 === 1;

  return (
    <div>
      {/* Page header */}
      <div style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
        <div className="sm-container" style={{ padding: "28px 24px 24px" }}>
          <div className="sm-page-eyebrow">Precision Mode — Reference-based</div>
          <h1 className="sm-page-title">Precision Mode</h1>
          <p className="sm-page-sub">
            Print an ArUco marker (DICT_4X4_50) at a known physical size and place it flat
            on the same plane as what you want to measure. The marker provides a known scale.
            Click two points on the image to measure the distance between them,
            converted to real-world centimeters via homography. Typical accuracy: ±1–3 cm.
          </p>
        </div>
      </div>

      <div className="sm-container" style={{ padding: "24px" }}>
        <div className="prec-workspace">
          {/* LEFT: Image + click-to-measure */}
          <div className="prec-image-panel sm-workspace-panel">
            {/* Controls */}
            <div className="sm-controls-bar">
              <div className="sm-field" style={{ flex: 1 }}>
                <label className="sm-field-label" htmlFor="prec-file">Image</label>
                <button
                  id="prec-file"
                  className="sm-btn sm-btn-outline sm-btn-sm"
                  onClick={() => inputRef.current?.click()}
                  type="button"
                >
                  <UploadIcon />
                  {file ? "Change image" : "Choose image"}
                </button>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  onChange={onFile}
                  hidden
                  aria-label="Upload image file"
                />
              </div>

              <div className="sm-field">
                <label className="sm-field-label" htmlFor="prec-marker">Marker size</label>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <input
                    id="prec-marker"
                    type="number"
                    min="1"
                    className="sm-input"
                    style={{ width: 80 }}
                    value={markerMm}
                    onChange={(e) => setMarkerMm(e.target.value)}
                  />
                  <span style={{ fontSize: 12, color: "var(--text-3)" }}>mm</span>
                </div>
              </div>

              <button
                className="sm-btn sm-btn-primary"
                onClick={run}
                disabled={!file || working}
                style={{ alignSelf: "flex-end" }}
              >
                {working ? "Measuring…" : "Measure"}
              </button>
            </div>

            {/* Hint when image is loaded */}
            {file && (
              <div className="sm-hint">
                <InfoIcon />
                Click two end-points per measurement on the image below.
                {" "}
                {pendingPoint && <span style={{ color: "var(--accent-text)", fontWeight: 600 }}>Click second point…</span>}
                {pairCount > 0 && (
                  <>
                    {" "}
                    <span style={{ color: "var(--accent-text)" }}>{pairCount} segment{pairCount > 1 ? "s" : ""} defined.</span>
                    {" "}
                    <button className="sm-link-btn" onClick={() => setPoints((p) => p.slice(0, -1))}>Undo</button>
                    {" · "}
                    <button className="sm-link-btn" onClick={() => setPoints([])}>Clear all</button>
                  </>
                )}
              </div>
            )}

            {/* Image or drop zone */}
            <div style={{ flex: 1 }}>
              {!url ? (
                <div
                  className={`sm-upload-zone${drag ? " drag-over" : ""}`}
                  style={{
                    borderRadius: 0,
                    border: "none",
                    borderTop: "1px dashed var(--border-strong)",
                    minHeight: 340,
                  }}
                  onClick={() => inputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                  onDragLeave={() => setDrag(false)}
                  onDrop={onDrop}
                  role="button"
                  tabIndex={0}
                  aria-label="Upload image drop zone"
                  onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
                >
                  <div className="sm-upload-icon">
                    <ImagePlaceholderIcon size={22} />
                  </div>
                  <div className="sm-upload-title">Drop an image here</div>
                  <div className="sm-upload-sub">Image must contain a printed ArUco marker</div>
                </div>
              ) : (
                <div className="sm-image-wrap" style={{ borderRadius: 0, border: "none", borderTop: "1px solid var(--border)" }}>
                  <img
                    ref={imgRef}
                    src={url}
                    alt="Uploaded image for precision measurement"
                    onClick={onImageClick}
                    onLoad={(e) => setDims({ w: e.target.naturalWidth, h: e.target.naturalHeight })}
                    className="sm-clickable"
                  />
                  {points.map(([x, y], i) => (
                    <div
                      key={i}
                      className="sm-point"
                      style={{
                        left: `${(x / dims.w) * 100}%`,
                        top: `${(y / dims.h) * 100}%`,
                        background: i % 2 === 0 ? "#1A8C6E" : "#E07040",
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Loader */}
            {working && (
              <div className="sm-loader-row">
                <LatticeLoader label="Working" pattern="orbit" color="var(--accent)" fontSize={13} showTimer />
                <span>Detecting ArUco marker · computing homography · measuring</span>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="sm-error" style={{ margin: "12px 16px" }}>
                <AlertIcon />
                {error}
              </div>
            )}
          </div>

          {/* RIGHT: Info + results */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* ArUco reference */}
            <div className="sm-workspace-panel">
              <div className="sm-panel-header">
                <span className="sm-panel-title">Reference marker</span>
              </div>
              <div className="sm-panel-body">
                <div className="prec-aruco-row">
                  <ArUcoMarkerPreview />
                  <div className="prec-aruco-info">
                    <p style={{ margin: "0 0 8px", fontSize: 13, color: "var(--text-2)" }}>
                      Print this ArUco marker (DICT_4X4_50) at exactly 100% scale.
                      Enter the printed side length in mm in the Marker size field.
                    </p>
                    <p style={{ margin: 0, fontSize: 12.5, color: "var(--text-3)" }}>
                      The marker must lie on the same plane as the measurement target.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Results panel */}
            <div className="sm-workspace-panel">
              <div className="sm-panel-header">
                <span className="sm-panel-title">Measurement results</span>
                {result && <span className="sm-label sm-label-teal">Marker ID {result.marker_id}</span>}
              </div>
              <div className="sm-panel-body">
                {!result ? (
                  <p style={{ fontSize: 13.5, color: "var(--text-3)", margin: 0 }}>
                    Upload an image with an ArUco marker, click measurement points,
                    and press <strong>Measure</strong>.
                  </p>
                ) : (
                  <div className="sm-fadein">
                    {result.warnings?.map((w) => (
                      <div key={w} className="sm-warning sm-mb-16">
                        <AlertIcon />
                        {w}
                      </div>
                    ))}

                    <div className="prec-results-list">
                      {result.results.map((r) => (
                        <div key={r.label} className="sm-dim-row" style={{ paddingLeft: 0, paddingRight: 0 }}>
                          <span className="sm-dim-name" style={{ width: "auto", minWidth: 100 }}>{r.label}</span>
                          <span className="sm-dim-value">{(r.mm / 10).toFixed(1)} cm</span>
                          <span className="sm-dim-range">{r.mm.toFixed(0)} mm</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Note */}
            <div className="prec-note-box">
              <InfoIcon />
              <div>
                Accuracy depends on marker placement, print scale, and camera angle.
                Marker must be on the same plane as the measured object.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
