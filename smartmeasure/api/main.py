import json
import os
from contextlib import asynccontextmanager

import numpy as np
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from smartmeasure.core.geometry import build_homography, distance_mm, marker_quality
from smartmeasure.core.imageio import decode_image
from smartmeasure.core.marker import detect_marker
from smartmeasure.estimation import estimator

MAX_BYTES = 10 * 1024 * 1024


@asynccontextmanager
async def lifespan(app: FastAPI):
    estimator.warmup()
    yield


app = FastAPI(title="SmartMeasure API", version="0.2.0", lifespan=lifespan)

origins = [
    o.strip()
    for o in os.getenv("CORS_ORIGIN", "http://localhost:5173").split(",")
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _fallback_quality(corners, marker_size_mm):
    """Compute side_ratio and px_per_mm straight from the marker corners.

    Used to fill in any key that marker_quality() does not return.
    """
    try:
        pts = np.asarray(corners, dtype=float).reshape(-1, 2)
        if len(pts) != 4:
            return {}
        sides = [float(np.linalg.norm(pts[i] - pts[(i + 1) % 4])) for i in range(4)]
        shortest, longest = min(sides), max(sides)
        return {
            "side_ratio": longest / shortest if shortest > 0 else 999.0,
            "px_per_mm": float(np.mean(sides)) / marker_size_mm,
        }
    except Exception:
        return {}


def _to_native(obj):
    """Recursively convert numpy types to plain Python so FastAPI can send JSON."""
    if isinstance(obj, dict):
        return {str(k): _to_native(v) for k, v in obj.items()}
    if isinstance(obj, (list, tuple)):
        return [_to_native(v) for v in obj]
    if isinstance(obj, np.ndarray):
        return _to_native(obj.tolist())
    if isinstance(obj, np.generic):
        return obj.item()
    return obj


@app.get("/")
def root():
    return {"status": "ok", "service": "Smart Measure API"}


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/measure")
async def measure(
    file: UploadFile = File(...),
    marker_size_mm: float = Form(...),
    segments: str = Form(...),
):
    if marker_size_mm <= 0:
        raise HTTPException(422, "marker_size_mm must be positive")

    data = await file.read()
    if len(data) > MAX_BYTES:
        raise HTTPException(413, "Image too large (max 10 MB)")

    try:
        img = decode_image(data)
    except Exception:
        raise HTTPException(400, "Could not read image")

    try:
        segs = json.loads(segments)
        if not isinstance(segs, list) or len(segs) == 0:
            raise ValueError
    except Exception:
        raise HTTPException(422, "segments must be a non-empty JSON list")

    found = detect_marker(img)
    if found is None:
        raise HTTPException(
            422,
            "No ArUco marker (DICT_4X4_50) found. "
            "Make sure it is fully visible, flat and well lit",
        )

    marker_id, corners = found
    H = build_homography(corners, marker_size_mm)

    q = marker_quality(corners, marker_size_mm)
    if not isinstance(q, dict):
        q = {}
    # Fill in any missing keys so the checks below never raise KeyError.
    for key, value in _fallback_quality(corners, marker_size_mm).items():
        q.setdefault(key, value)
    print("QUALITY:", q)

    warnings = []
    if q.get("side_ratio", 1.0) > 1.5:
        warnings.append(
            "Marker is strongly tilted; accuracy may be reduced. Retake more front-on"
        )
    if q.get("px_per_mm", 99.0) < 1.0:
        warnings.append(
            "Marker is small in the image; move closer for better accuracy."
        )

    try:
        results = [
            {
                "label": s.get("label", "Segment"),
                "mm": round(distance_mm(H, s["p1"], s["p2"]), 1),
            }
            for s in segs
        ]
    except (KeyError, TypeError, ValueError, AttributeError):
        raise HTTPException(422, "Each segment needs p1 and p2 as [x, y]")

    return _to_native(
        {
            "marker_id": marker_id,
            "results": results,
            "quality": q,
            "warnings": warnings,
        }
    )


@app.post("/api/estimate")
def estimate_size(file: UploadFile = File(...), scene: str = Form("indoor")):
    if scene not in ("indoor", "outdoor"):
        raise HTTPException(422, "scene must be 'indoor' or 'outdoor'")

    data = file.file.read()
    if len(data) > MAX_BYTES:
        raise HTTPException(413, "Image too large (max 10 MB)")

    try:
        img = decode_image(data)
    except Exception:
        raise HTTPException(400, "Could not read image")

    return _to_native(estimator.estimate(img, data, scene))