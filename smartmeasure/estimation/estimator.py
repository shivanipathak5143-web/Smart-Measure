from concurrent.futures import ThreadPoolExecutor

import cv2
import numpy as np

from .camera import focal_px
from .depth import DepthEstimator
from .fusion import confidence, fuse
from .priors import PRIORS
from .segment import raw_candidates, segment

MAX_SIDE = 1024
GEO_REL_SIGMA = {"indoor": 0.12, "outdoor": 0.18}

_depth = DepthEstimator()
_pool = ThreadPoolExecutor(max_workers=2)


def warmup():
    dummy = np.zeros((64, 64, 3), np.uint8)
    _depth.predict(dummy, "indoor")
    segment(dummy)


def _extent_cm(vals: np.ndarray) -> float:
    lo, hi = np.percentile(vals, [2, 98])
    return float((hi - lo) * 100)


def _dims_from_pixels(xs, ys, z, f, cx, cy):
    X = (xs - cx) * z / f
    Y = (ys - cy) * z / f
    return {"height": _extent_cm(Y), "width": _extent_cm(X)}


def estimate(img_bgr: np.ndarray, raw_bytes: bytes, scene: str = "indoor"):
    """Auto mode: detect + segment known object classes (YOLO/COCO vocabulary)."""
    h0, w0 = img_bgr.shape[:2]
    s = min(1.0, MAX_SIDE / max(h0, w0))
    img = cv2.resize(img_bgr, None, fx=s, fy=s, interpolation=cv2.INTER_AREA) if s < 1 else img_bgr
    h, w = img.shape[:2]

    f, f_src = focal_px(raw_bytes, w, h)
    cx, cy = w / 2, h / 2

    depth_future = _pool.submit(_depth.predict, cv2.cvtColor(img, cv2.COLOR_BGR2RGB), scene)
    dets_future = _pool.submit(segment, img)
    depth = depth_future.result()
    dets = dets_future.result()

    dets = [d for d in dets if d["label"] in PRIORS]
    kernel = np.ones((5, 5), np.uint8)

    objects = []
    for d in dets:
        mask = cv2.erode(d["mask"].astype(np.uint8), kernel).astype(bool)
        ys, xs = np.nonzero(mask)
        if len(xs) < 200:
            continue
        z = depth[ys, xs]
        keep = (z > 0.1) & (z > np.percentile(z, 5)) & (z < np.percentile(z, 95))
        xs, ys, z = xs[keep], ys[keep], z[keep]
        if len(z) < 100:
            continue

        dims = _dims_from_pixels(xs, ys, z, f, cx, cy)
        out = {
            "label": d["label"],
            "detector_conf": round(d["conf"], 2),
            "bbox": [round(v / s) for v in d["bbox"]],
            "distance_m": round(float(np.median(z)), 2),
            "truncated": d["truncated"],
            "dims": {},
            "notes": [],
        }
        if d["truncated"]:
            out["notes"].append(
                "Object touches the image edge; size is likely underestimated. Retake with the whole object visible."
            )

        for name, geo in dims.items():
            prior = PRIORS.get(d["label"], {}).get(name)
            if d["truncated"]:
                prior = None
            mean, sigma, notes = fuse(geo, GEO_REL_SIGMA[scene], prior)
            out["dims"][name] = {
                "geometry_cm": round(geo, 1),
                "estimate_cm": round(mean, 1),
                "range_cm": [round(mean - 2 * sigma, 1), round(mean + 2 * sigma, 1)],
                "confidence": confidence(sigma, mean, d["truncated"], f_src == "exif"),
                "used_prior": prior is not None,
            }
            out["notes"] += notes
        objects.append(out)

    warnings = []
    if f_src != "exif":
        warnings.append(
            "No camera focal length in EXIF (photo may be forwarded or a screenshot). "
            "Assumed a 26 mm phone lens; accuracy reduced."
        )
    if not objects:
        candidates = raw_candidates(img)
        if candidates:
            top = sorted(candidates, key=lambda c: -c["conf"])[:3]
            names = ", ".join(f"{c['label']} ({c['conf']*100:.0f}%)" for c in top)
            warnings.append(
                f"No object in this photo matches a known category. YOLO's best weak guesses were: {names}. "
                "This usually means the object isn't one of the ~80 categories the detector was trained on "
                "(e.g. containers, tools, toys aren't included). Use Manual Region mode below to measure it anyway."
            )
        else:
            warnings.append(
                "No objects detected at all. Try a clearer photo, or use Manual Region mode below."
            )

    return {"scene": scene, "focal_source": f_src, "objects": objects, "warnings": warnings}


def estimate_region(img_bgr: np.ndarray, raw_bytes: bytes, bbox, scene: str = "indoor"):
    """Manual mode: measure whatever is inside a user-drawn box, regardless of
    whether the detector recognizes it. No class prior is available, so the
    estimate is geometry-only -- confidence is capped lower than auto mode."""
    h0, w0 = img_bgr.shape[:2]
    s = min(1.0, MAX_SIDE / max(h0, w0))
    img = cv2.resize(img_bgr, None, fx=s, fy=s, interpolation=cv2.INTER_AREA) if s < 1 else img_bgr
    h, w = img.shape[:2]

    f, f_src = focal_px(raw_bytes, w, h)
    cx, cy = w / 2, h / 2

    depth = _depth.predict(cv2.cvtColor(img, cv2.COLOR_BGR2RGB), scene)

    x1, y1, x2, y2 = [v * s for v in bbox]  # bbox given in ORIGINAL image pixel coords
    x1, x2 = sorted((max(0, x1), min(w, x2)))
    y1, y2 = sorted((max(0, y1), min(h, y2)))
    if x2 - x1 < 5 or y2 - y1 < 5:
        return {"error": "Selected region is too small."}

    # shrink the box slightly inward so we don't sample depth from the background edge
    pad_x, pad_y = (x2 - x1) * 0.08, (y2 - y1) * 0.08
    xs_grid, ys_grid = np.meshgrid(
        np.arange(int(x1 + pad_x), int(x2 - pad_x)),
        np.arange(int(y1 + pad_y), int(y2 - pad_y)),
    )
    xs, ys = xs_grid.ravel(), ys_grid.ravel()
    if len(xs) < 100:
        return {"error": "Selected region is too small after margin trimming -- draw a bigger box."}

    z = depth[ys, xs]
    keep = (z > 0.1) & (z > np.percentile(z, 5)) & (z < np.percentile(z, 95))
    xs, ys, z = xs[keep], ys[keep], z[keep]
    if len(z) < 50:
        return {"error": "Couldn't get a reliable depth reading in this region. Try better lighting or a different box."}

    dims = _dims_from_pixels(xs, ys, z, f, cx, cy)
    touches_edge = x1 < 3 or y1 < 3 or x2 > w - 3 or y2 > h - 3

    out = {
        "label": "custom region",
        "distance_m": round(float(np.median(z)), 2),
        "truncated": touches_edge,
        "dims": {},
        "notes": [],
    }
    if touches_edge:
        out["notes"].append("Selected box touches the image edge; size may be underestimated.")

    for name, geo in dims.items():
        # No class prior exists for a manual region, so this is geometry-only.
        mean, sigma, notes = fuse(geo, GEO_REL_SIGMA[scene], None)
        out["dims"][name] = {
            "geometry_cm": round(geo, 1),
            "estimate_cm": round(mean, 1),
            "range_cm": [round(mean - 2 * sigma, 1), round(mean + 2 * sigma, 1)],
            "confidence": confidence(sigma, mean, touches_edge, f_src == "exif"),
            "used_prior": False,
        }
        out["notes"] += notes

    warnings = []
    if f_src != "exif":
        warnings.append(
            "No camera focal length in EXIF (photo may be forwarded or a screenshot). "
            "Assumed a 26 mm phone lens; accuracy reduced."
        )
    warnings.append("Manual region mode has no size prior to cross-check against, so treat results as a rougher estimate than auto-detected objects.")

    return {"scene": scene, "focal_source": f_src, "objects": [out], "warnings": warnings}