import { useRef, useState } from "react";
import TechText from "./components/TechText";
import LatticeLoader from "./components/LatticeLoader";
import "./App.css";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export default function App() {
  const [mode, setMode] = useState("estimate"); // "estimate" | "marker"
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState(null);
  const [dims, setDims] = useState({ w: 1, h: 1 });
  const [scene, setScene] = useState("indoor");
  const [markerMm, setMarkerMm] = useState(100);
  const [points, setPoints] = useState([]);
  const [loadStatus, setLoadStatus] = useState("done"); // "working" | "done" | "error"
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const imgRef = useRef(null);

  function resetForNewFile(e) {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setUrl(URL.createObjectURL(f));
    setPoints([]);
    setResult(null);
    setError("");
    setLoadStatus("done");
  }

  function onImageClick(e) {
    if (mode !== "marker") return;
    const img = imgRef.current;
    const r = img.getBoundingClientRect();
    const x = ((e.clientX - r.left) * img.naturalWidth) / r.width;
    const y = ((e.clientY - r.top) * img.naturalHeight) / r.height;
    setPoints((p) => [...p, [x, y]]);
  }

  async function runEstimate() {
    setError("");
    setResult(null);
    setLoadStatus("working");
    const form = new FormData();
    form.append("file", file);
    form.append("scene", scene);
    try {
      const res = await fetch(`${API}/api/estimate`, { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Request failed");
      setResult({ kind: "estimate", data });
      setLoadStatus("done");
    } catch (err) {
      setError(err.message);
      setLoadStatus("error");
    }
  }

  async function runMeasure() {
    setError("");
    setResult(null);
    const segments = [];
    for (let i = 0; i + 1 < points.length; i += 2) {
      segments.push({ label: `Measurement ${i / 2 + 1}`, p1: points[i], p2: points[i + 1] });
    }
    if (segments.length === 0) {
      setError("Click two points on the image to define a measurement first.");
      return;
    }
    setLoadStatus("working");
    const form = new FormData();
    form.append("file", file);
    form.append("marker_size_mm", String(markerMm));
    form.append("segments", JSON.stringify(segments));
    try {
      const res = await fetch(`${API}/api/measure`, { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Request failed");
      setResult({ kind: "marker", data });
      setLoadStatus("done");
    } catch (err) {
      setError(err.message);
      setLoadStatus("error");
    }
  }

  function go() {
    if (!file) {
      setError("Upload a photo first.");
      return;
    }
    mode === "estimate" ? runEstimate() : runMeasure();
  }

  const working = loadStatus === "working";

  return (
    <div className="sm-root">
      <header className="sm-hero">
        <div className="sm-hero-text">
          <TechText
            text="SmartMeasure"
            fontSize={64}
            fontWeight={700}
            color="#e8edf5"
            accentColor="#5ee0c0"
            reveal="letter"
            specks={12}
          />
        </div>
        <p className="sm-tagline">
          Estimate real-world object dimensions from a single photo — with or without a reference marker.
        </p>
      </header>

      <main className="sm-main">
        <section className="sm-panel">
          <div className="sm-mode-toggle" role="tablist">
            <button
              role="tab"
              aria-selected={mode === "estimate"}
              className={mode === "estimate" ? "active" : ""}
              onClick={() => { setMode("estimate"); setResult(null); setPoints([]); setError(""); }}
            >
              🤖 AI Estimate <span className="sm-sub">no marker needed</span>
            </button>
            <button
              role="tab"
              aria-selected={mode === "marker"}
              className={mode === "marker" ? "active" : ""}
              onClick={() => { setMode("marker"); setResult(null); setPoints([]); setError(""); }}
            >
              📏 Precision Mode <span className="sm-sub">ArUco marker, ±1–3 cm</span>
            </button>
          </div>

          <div className="sm-controls">
            <label className="sm-file-btn">
              {file ? "Change photo" : "Upload a photo"}
              <input type="file" accept="image/*" onChange={resetForNewFile} hidden />
            </label>

            {mode === "estimate" ? (
              <label className="sm-field">
                Scene
                <select value={scene} onChange={(e) => setScene(e.target.value)}>
                  <option value="indoor">Indoor</option>
                  <option value="outdoor">Outdoor</option>
                </select>
              </label>
            ) : (
              <label className="sm-field">
                Marker size (mm)
                <input
                  type="number"
                  min="1"
                  value={markerMm}
                  onChange={(e) => setMarkerMm(e.target.value)}
                />
              </label>
            )}

            <button className="sm-run-btn" onClick={go} disabled={!file || working}>
              {working ? "Working…" : mode === "estimate" ? "Estimate size" : "Measure"}
            </button>
          </div>

          {mode === "marker" && file && (
            <p className="sm-hint">
              Click the two end points of each measurement on the photo below. Click multiple pairs for multiple measurements.
              {points.length > 0 && (
                <>
                  {" "}
                  <button className="sm-link-btn" onClick={() => setPoints((p) => p.slice(0, -1))}>Undo</button>
                  {" · "}
                  <button className="sm-link-btn" onClick={() => setPoints([])}>Clear</button>
                </>
              )}
            </p>
          )}

          {url && (
            <div className="sm-image-wrap">
              <img
                ref={imgRef}
                src={url}
                alt="uploaded"
                onClick={onImageClick}
                onLoad={(e) => setDims({ w: e.target.naturalWidth, h: e.target.naturalHeight })}
                className={mode === "marker" ? "sm-clickable" : ""}
              />

              {mode === "marker" &&
                points.map(([x, y], i) => (
                  <div
                    key={i}
                    className="sm-point"
                    style={{
                      left: `${(x / dims.w) * 100}%`,
                      top: `${(y / dims.h) * 100}%`,
                      background: i % 2 === 0 ? "#ff5d73" : "#5ee0c0",
                    }}
                  />
                ))}

              {mode === "estimate" &&
                result?.kind === "estimate" &&
                result.data.objects.map((o, i) => {
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
          )}

          {working && (
            <div className="sm-loader-row">
              <LatticeLoader
                status="working"
                label={mode === "estimate" ? "Estimating size" : "Measuring"}
                pattern="orbit"
                grid={3}
                shape="round"
                color="#5ee0c0"
                cellSize={8}
                gap={3}
                fontSize={15}
                glow
                showTimer
              />
            </div>
          )}

          {error && <p className="sm-error">⚠ {error}</p>}
        </section>

        {result?.kind === "estimate" && (
          <section className="sm-results">
            {result.data.warnings.map((w) => (
              <p key={w} className="sm-warning">⚠ {w}</p>
            ))}
            {result.data.objects.length === 0 && !result.data.warnings.length && (
              <p className="sm-warning">No measurable objects detected.</p>
            )}
            {result.data.objects.map((o, i) => (
              <div key={i} className="sm-result-card">
                <h3>{i + 1}. {o.label} <span className="sm-dist">~{o.distance_m} m from camera</span></h3>
                {Object.entries(o.dims).map(([k, v]) => (
                  <div key={k} className="sm-dim-row">
                    <span className="sm-dim-name">{k}</span>
                    <span className="sm-dim-value">{v.estimate_cm} cm</span>
                    <span className="sm-dim-range">range {v.range_cm[0]}–{v.range_cm[1]} cm</span>
                    <span className={`sm-confidence sm-conf-${v.confidence}`}>{v.confidence}</span>
                  </div>
                ))}
                {o.notes.map((n) => <p key={n} className="sm-note">⚠ {n}</p>)}
              </div>
            ))}
          </section>
        )}

        {result?.kind === "marker" && (
          <section className="sm-results">
            {result.data.warnings.map((w) => (
              <p key={w} className="sm-warning">⚠ {w}</p>
            ))}
            <div className="sm-result-card">
              <h3>Marker ID {result.data.marker_id} detected</h3>
              {result.data.results.map((r) => (
                <div key={r.label} className="sm-dim-row">
                  <span className="sm-dim-name">{r.label}</span>
                  <span className="sm-dim-value">{(r.mm / 10).toFixed(1)} cm</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="sm-footer">
        Computer vision pipeline: YOLOv8-seg · Depth Anything V2 · ArUco + homography · built with FastAPI &amp; React
      </footer>
    </div>
  );
}