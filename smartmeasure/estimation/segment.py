import cv2
import numpy as np
from ultralytics import YOLO

_model = None


def _get():
    global _model
    if _model is None:
        _model = YOLO("yolov8n-seg.pt")   # use yolov8s-seg.pt for better masks
    return _model


def segment(img_bgr: np.ndarray, conf: float = 0.35):
    h, w = img_bgr.shape[:2]
    r = _get().predict(img_bgr, conf=conf, verbose=False)[0]
    dets = []
    if r.masks is None:
        return dets
    for box, poly in zip(r.boxes, r.masks.xy):   # polygons in original pixel coords
        if len(poly) < 3:
            continue
        mask = np.zeros((h, w), np.uint8)
        cv2.fillPoly(mask, [poly.astype(np.int32)], 1)
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