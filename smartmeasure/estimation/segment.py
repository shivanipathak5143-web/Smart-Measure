import cv2
import numpy as np
from ultralytics import YOLO

_model = None
MIN_MASK_FRACTION = 0.01  # ignore masks smaller than 1% of the image area


def _get():
    global _model
    if _model is None:
        _model = YOLO("yolov8s-seg.pt")  # small model: better accuracy than nano
    return _model


def segment(img_bgr: np.ndarray, conf: float = 0.25):
    """conf lowered from 0.5 -> 0.25. Unusual framings (closed laptop lids,
    objects filling the whole frame, odd angles) often get a correct but
    lower-confidence prediction from YOLO. Measurement-grade filtering still
    happens downstream via MIN_MASK_FRACTION and the PRIORS whitelist."""
    h, w = img_bgr.shape[:2]
    min_pixels = MIN_MASK_FRACTION * h * w
    r = _get().predict(img_bgr, conf=conf, verbose=False)[0]
    dets = []
    if r.masks is None:
        return dets
    for box, poly in zip(r.boxes, r.masks.xy):  # polygons in original pixel coords
        if len(poly) < 3:
            continue
        mask = np.zeros((h, w), np.uint8)
        cv2.fillPoly(mask, [poly.astype(np.int32)], 1)
        if mask.sum() < min_pixels:
            continue  # too small to trust
        x1, y1, x2, y2 = box.xyxy[0].tolist()
        m = 3  # px margin for "touches image border" check
        dets.append({
            "label": r.names[int(box.cls)],
            "conf": float(box.conf),
            "bbox": [x1, y1, x2, y2],
            "mask": mask.astype(bool),
            "truncated": x1 < m or y1 < m or x2 > w - m or y2 > h - m,
        })
    return dets


def raw_candidates(img_bgr: np.ndarray, conf: float = 0.05):
    """Debug helper: shows every detection YOLO considered, even very weak
    ones, with no mask/size filtering. Use this to diagnose a 'no objects
    detected' result — it tells you whether YOLO saw something and rejected
    it, or saw nothing at all."""
    r = _get().predict(img_bgr, conf=conf, verbose=False)[0]
    if r.boxes is None:
        return []
    return [
        {"label": r.names[int(b.cls)], "conf": round(float(b.conf), 3)}
        for b in r.boxes
    ]