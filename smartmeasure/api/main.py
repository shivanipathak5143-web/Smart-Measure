import json
import os
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from smartmeasure.core.geometry import build_homography,distance_mm, marker_quality
from smartmeasure.core.imageio import decode_image 
from smartmeasure.core.marker import detect_marker

MAX_BYTES=10*1024*1024

app=FastAPI(title="SmartMeasure API",version="0.1.0")
origins=[o.strip() for o in os.getenv("CORS_ORIGIN","http://localhost:5173",split(","))]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/api/health")
def health():
    return {"status":"ok"}

@app.get("api/measure")
async def measure(
    file: UploadFile=File(...),
    marker_size_mm:float=Form(...),
    segments:str=Form(...)
):
    if marker_size_mm<=0:
        raise HTTPException(422, "marker_size_mm must be positive")
    data=await file.read()
    if len(data)>MAX_BYTES:
        raise HTTPException(413,"Image too large (max 10 MB)")

    try:
        img=decode_image(data)
    except Exception:
        raise HTTPException(400,"Could not read image")

    try:
        segs=json.load(segments)
        assert isinstance(segs,list) and len(segs)>0
    except Exception:
        raise HTTPException(422, "segments must be a non-empty JSON list")

    found=detect_marker(img)
    if found is None:
        raise HTTPException(
            422,"No ArUco marker (DICT_4X4_50) found. Make sure it is fully visible, flat and well lit"
        )
    marker_id, corners=found
    H=build_homography(corners, marker_size_mm)
    q=marker_quality(corners, marker_size_mm)

    warnings=[]
    if q["side_ratio"]>1.5:
        warnings.append("Marker is strongly tilted; accuracy may be reduced. Retake more front-on")
    if q["px_per_mm"]<1.0:
        warnings.append("Marker is small in the image; move closer for better accuracy.")

    try:
        results = [
            {
                "label": s.get("label", "Segment"),
                "mm": round(distance_mm(H, s["p1"], s["p2"]), 1),
            }
            for s in segs
        ]
    except (KeyError, TypeError, ValueError):
        raise HTTPException(422, "Each segment needs p1 and p2 as [x, y]")

    return {
        "marker_id": marker_id,
        "results": results,
        "quality": q,
        "warnings": warnings,
    }