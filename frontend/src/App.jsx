import { useState } from "react";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export default function App() {
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState(null);
  const [scene, setScene] = useState("indoor");
  const [res, setRes] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [dims, setDims] = useState({ w: 1, h: 1 });

  function onFile(e) {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f); setUrl(URL.createObjectURL(f)); setRes(null); setErr("");
  }

  async function run() {
    setLoading(true); setErr(""); setRes(null);
    const form = new FormData();
    form.append("file", file);
    form.append("scene", scene);
    try {
      const r = await fetch(`${API}/api/estimate`, { method: "POST", body: form });
      const data = await r.json();
      if (!r.ok) throw new Error(data.detail || "Request failed");
      setRes(data);
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24, fontFamily: "system-ui" }}>
      <h1>📏 SmartMeasure</h1>
      <p>Upload an original photo (not a WhatsApp forward) with the whole object visible,
         taken roughly level. You get an <b>estimate with a range</b>, not an exact measurement.</p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <input type="file" accept="image/*" onChange={onFile} />
        <select value={scene} onChange={(e) => setScene(e.target.value)}>
          <option value="indoor">Indoor</option>
          <option value="outdoor">Outdoor</option>
        </select>
        <button onClick={run} disabled={!file || loading}>{loading ? "Estimating..." : "Estimate size"}</button>
      </div>

      {err && <p style={{ color: "crimson" }}>{err}</p>}

      {url && (
        <div style={{ position: "relative", display: "inline-block", marginTop: 16 }}>
          <img src={url} alt="" style={{ maxWidth: "100%", display: "block" }}
               onLoad={(e) => setDims({ w: e.target.naturalWidth, h: e.target.naturalHeight })} />
          {res?.objects.map((o, i) => {
            const [x1, y1, x2, y2] = o.bbox;
            return (
              <div key={i} style={{
                position: "absolute", border: "2px solid lime", pointerEvents: "none",
                left: `${(x1 / dims.w) * 100}%`, top: `${(y1 / dims.h) * 100}%`,
                width: `${((x2 - x1) / dims.w) * 100}%`, height: `${((y2 - y1) / dims.h) * 100}%`,
              }}>
                <span style={{ background: "lime", fontSize: 12, padding: "0 4px" }}>{i + 1}. {o.label}</span>
              </div>
            );
          })}
        </div>
      )}

      {res?.warnings.map((w) => <p key={w} style={{ color: "darkorange" }}>⚠ {w}</p>)}

      {res?.objects.map((o, i) => (
        <div key={i} style={{ marginTop: 12, padding: 12, border: "1px solid #ccc", borderRadius: 8 }}>
          <b>{i + 1}. {o.label}</b> (~{o.distance_m} m from camera)
          {Object.entries(o.dims).map(([k, v]) => (
            <p key={k} style={{ margin: "6px 0" }}>
              {k}: <b>{v.estimate_cm} cm</b> (range {v.range_cm[0]}–{v.range_cm[1]}) · confidence: {v.confidence}
              {v.used_prior ? " · size prior used" : ""}
            </p>
          ))}
          {o.notes.map((n) => <p key={n} style={{ color: "darkorange", margin: 0 }}>⚠ {n}</p>)}
        </div>
      ))}
    </div>
  );
}