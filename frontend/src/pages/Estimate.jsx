import { useState, useRef } from "react";
import "./Estimate.css";

import LatticeLoader from "../components/LatticeLoader";
const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

/* ─── SVG Icons ─────────────────────────────────────────── */

function UploadIcon({ size = 20 }) {
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

function InfoIcon({ size = 14 }) {
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

/* ─── Estimate page ─────────────────────────────────────── */

export default function Estimate() {
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState(null);
  const [dims, setDims] = useState({ w: 1, h: 1 });
  const [scene, setScene] = useState("indoor");
  const [status, setStatus] = useState("idle"); // idle | working | done | error
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [drag, setDrag] = useState(false);
  const inputRef = useRef(null);

  function handleFile(f) {
    if (!f) return;
    setFile(f);
    setUrl(URL.createObjectURL(f));
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

  async function run() {
    if (!file) { setError("Upload a photo first."); return; }
    setError("");
    setResult(null);
    setStatus("working");
    const form = new FormData();
    form.append("file", file);
    form.append("scene", scene);
    try {
      const res = await fetch(`${API}/api/estimate`, { method: "POST", body: form });
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

  return (
    <div>
      {/* Page header */}
      <div style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
        <div className="sm-container" style={{ padding: "28px 24px 24px" }}>
          <div className="sm-page-eyebrow">AI Estimate — No Reference Marker</div>
          <h1 className="sm-page-title">AI Estimate</h1>
          <p className="sm-page-sub">
            Upload an original photo with the whole object visible, taken roughly level.
            The system uses object segmentation, depth estimation, and size priors
            to estimate dimensions. Results include a confidence range, not an exact measurement.
          </p>
        </div>
      </div>

      <div className="sm-container" style={{ padding: "24px" }}>
        <div className="est-workspace">
          {/* LEFT: Image area */}
          <div className="est-image-panel sm-workspace-panel">
            {/* Controls bar */}
            <div className="sm-controls-bar">
              <div className="sm-field" style={{ flex: 1 }}>
                <label className="sm-field-label" htmlFor="est-file">Image</label>
                <button
                  id="est-file"
                  className="sm-btn sm-btn-outline sm-btn-sm"
                  onClick={() => inputRef.current?.click()}
                  type="button"
                >
                  <UploadIcon size={14} />
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
                <label className="sm-field-label" htmlFor="est-scene">Scene</label>
                <select
                  id="est-scene"
                  className="sm-select"
                  value={scene}
                  onChange={(e) => setScene(e.target.value)}
                  style={{ width: "130px" }}
                >
                  <option value="indoor">Indoor</option>
                  <option value="outdoor">Outdoor</option>
                </select>
              </div>

              <button
                className="sm-btn sm-btn-primary"
                onClick={run}
                disabled={!file || working}
                style={{ alignSelf: "flex-end" }}
              >
                {working ? "Estimating…" : "Estimate size"}
              </button>
            </div>

            {/* Image / drop zone */}
            <div className="sm-panel-body" style={{ padding: 0 }}>
              {!url ? (
                <div
                  className={`sm-upload-zone est-drop-zone${drag ? " drag-over" : ""}`}
                  style={{ borderRadius: 0, border: "none", borderTop: "1px dashed var(--border-strong)", minHeight: 320 }}
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
                  <div className="sm-upload-sub">or click to choose a file — JPG, PNG, WEBP</div>
                </div>
              ) : (
                <div className="est-image-view">
                  <div className="sm-image-wrap" style={{ borderRadius: 0, border: "none", borderTop: "1px solid var(--border)" }}>
                    <img
                      src={url}
                      alt="Uploaded image for estimation"
                      onLoad={(e) => setDims({ w: e.target.naturalWidth, h: e.target.naturalHeight })}
                    />
                    {result?.objects.map((o, i) => {
                      const [x1, y1, x2, y2] = o.bbox;
                      return (
                        <div
                          key={i}
                          className="sm-bbox"
                          style={{
                            left: `${(x1 / dims.w) * 100}%`,
                            top: `${(y1 / dims.h) * 100}%`,
                            width: `${((x2 - x1) / dims.w) * 100}%`,
                            height: `${((y2 - y1) / dims.h) * 100}%`,
                          }}
                        >
                          <span className="sm-bbox-label">{i + 1}. {o.label}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="est-image-footer">
                    <span className="est-image-filename">{file?.name}</span>
                    <button
                      className="sm-btn sm-btn-outline sm-btn-sm"
                      onClick={() => inputRef.current?.click()}
                    >
                      Change image
                    </button>
                  </div>
                </div>
              )}

              {working && (
                <div className="sm-loader-row">
                  <LatticeLoader label="Working" pattern="orbit" color="var(--accent)" fontSize={13} showTimer />
                  <span>Analyzing image — object detection · depth estimation · size calculation</span>
                </div>
              )}

              {error && (
                <div className="sm-error" style={{ margin: "12px 16px" }}>
                  <AlertIcon />
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Results panel */}
          <div>
            <div className="sm-workspace-panel">
              <div className="sm-panel-header">
                <span className="sm-panel-title">Measurement results</span>
                {result && (
                  <span className="sm-label sm-label-teal">
                    {result.objects.length} object{result.objects.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>

              <div className="sm-panel-body">
                {!result && !working && (
                  <div className="est-results-empty">
                    <p className="est-results-empty-text">
                      Upload an image and click <strong>Estimate size</strong> to see results here.
                    </p>
                    <div className="est-results-legend">
                      <div className="est-legend-row">
                        <span className="sm-confidence sm-conf-high">high</span>
                        <span>Reliable estimate</span>
                      </div>
                      <div className="est-legend-row">
                        <span className="sm-confidence sm-conf-medium">medium</span>
                        <span>Reasonable estimate</span>
                      </div>
                      <div className="est-legend-row">
                        <span className="sm-confidence sm-conf-low">low</span>
                        <span>Use with caution</span>
                      </div>
                    </div>
                  </div>
                )}

                {result && (
                  <div className="sm-fadein">
                    {result.warnings?.map((w) => (
                      <div key={w} className="sm-warning sm-mb-16">
                        <AlertIcon />
                        {w}
                      </div>
                    ))}

                    <div className="est-results-list">
                      {result.objects.map((o, i) => (
                        <div key={i} className="sm-result-card">
                          <div className="sm-result-card-header">
                            <h3 className="sm-result-card-title">
                              <span className="est-obj-num">{i + 1}</span>
                              {o.label}
                            </h3>
                            <span className="sm-result-dist">
                              ~{o.distance_m} m · {Math.round(o.detector_conf * 100)}% detect
                            </span>
                          </div>

                          <div className="sm-result-card-body">
                            {Object.entries(o.dims).map(([k, v]) => (
                              <div key={k} className="sm-dim-row">
                                <span className="sm-dim-name">{k}</span>
                                <span className="sm-dim-value">{v.estimate_cm} cm</span>
                                <span className="sm-dim-range">{v.range_cm[0]}–{v.range_cm[1]}</span>
                                <span className={`sm-confidence sm-conf-${v.confidence}`}>{v.confidence}</span>
                              </div>
                            ))}
                            {o.notes?.map((n) => (
                              <div key={n} className="sm-note">
                                <AlertIcon size={12} /> {n}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Note */}
            <div className="est-note-box">
              <InfoIcon size={13} />
              <div>
                Results are AI estimates and may vary. Accuracy depends on image quality,
                camera angle, and EXIF focal-length data.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
