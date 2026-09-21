import { useRef, useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function App() {
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState(null);
  const [points, setPoints] = useState([]);
  const [markerMm, setMarkerMm] = useState(100);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [dims, setDims] = useState({ w: 1, h: 1 });
  const imgRef = useRef(null);

  function onFile(e) {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setUrl(URL.createObjectURL(f));
    setPoints([]);
    setResult(null);
    setError("");
  }

  function onImageClick(e) {
    const img = imgRef.current;
    const r = img.getBoundingClientRect();
    // convert displayed-pixel click -> original image pixel coordinates
    const x = ((e.clientX - r.left) * img.naturalWidth) / r.width;
    const y = ((e.clientY - r.top) * img.naturalHeight) / r.height;
    setPoints((p) => [...p, [x, y]]);
  }

  async function measure() {
    setError("");
    setResult(null);
    const segments = [];
    for (let i = 0; i + 1 < points.length; i += 2) {
      segments.push({ label: `Measurement ${i / 2 + 1}`, p1: points[i], p2: points[i + 1] });
    }
    if (!file || segments.length === 0) {
      setError("Upload an image and click two points per measurement.");
      return;
    }
    const form = new FormData();
    form.append("file", file);
    form.append("marker_size_mm", String(markerMm));
    form.append("segments", JSON.stringify(segments));

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/measure`, { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Request failed");
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24, fontFamily: "system-ui" }}>
      <h1>📏 SmartMeasure</h1>
      <p>
        1) Stick a printed ArUco marker on the same flat plane you want to measure. 2) Upload the
        photo. 3) Click the two end points of each measurement. 4) Press Measure.
      </p>

      <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
        <input type="file" accept="image/*" onChange={onFile} />
        <label>
          Marker size (mm):{" "}
          <input
            type="number"
            min="1"
            value={markerMm}
            onChange={(e) => setMarkerMm(e.target.value)}
            style={{ width: 80 }}
          />
        </label>
      </div>

      {url && (
        <>
          <div style={{ position: "relative", display: "inline-block", marginTop: 16 }}>
            <img
              ref={imgRef}
              src={url}
              alt="upload"
              onClick={onImageClick}
              onLoad={(e) =>
                setDims({ w: e.target.naturalWidth, h: e.target.naturalHeight })
              }
              style={{ maxWidth: "100%", cursor: "crosshair", display: "block" }}
            />
            {points.map(([x, y], i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: `${(x / dims.w) * 100}%`,
                  top: `${(y / dims.h) * 100}%`,
                  width: 12,
                  height: 12,
                  marginLeft: -6,
                  marginTop: -6,
                  borderRadius: "50%",
                  background: i % 2 === 0 ? "red" : "dodgerblue",
                  border: "2px solid white",
                  pointerEvents: "none",
                }}
              />
            ))}
          </div>
          <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
            <button onClick={() => setPoints((p) => p.slice(0, -1))}>Undo</button>
            <button onClick={() => setPoints([])}>Clear</button>
            <button onClick={measure} disabled={loading}>
              {loading ? "Measuring..." : "Measure"}
            </button>
          </div>
        </>
      )}

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {result && (
        <div style={{ marginTop: 16, padding: 16, border: "1px solid #ccc", borderRadius: 8 }}>
          <h3>Results</h3>
          {result.results.map((r) => (
            <p key={r.label}>
              <b>{r.label}:</b> {(r.mm / 10).toFixed(1)} cm
            </p>
          ))}
          {result.warnings.map((w) => (
            <p key={w} style={{ color: "darkorange" }}>⚠ {w}</p>
          ))}
        </div>
      )}
    </div>
  );
}