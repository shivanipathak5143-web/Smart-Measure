from concurrent.futures import ThreadPoolExecutor

import cv2
import numpy as np

from .camera import focal_px
from .depth import DepthEstimator
from .fusion import confidence, fuse
from .priors import PRIORS
from .segment import raw_candidates, segment

MAX_SIDE = 1024  # detection resolution; depth uses its own DEPTH_SIDE internally
GEO_REL_SIGMA = {"indoor": 0.12, "outdoor": 0.18}

_depth = DepthEstimator()
_pool = ThreadPoolExecutor(max_workers=2)  # runs YOLO and depth concurrently


def warmup():
    dummy = np.zeros((64, 64, 3), np.uint8)
    _depth.predict(dummy, "indoor")
    segment(dummy)


def _extent_cm(vals: np.ndarray) -> float:
    lo, hi = np.percentile(vals, [2, 98])
    return float((hi - lo) * 100)


def estimate(img_bgr: np.ndarray, raw_bytes: bytes, scene: str = "indoor"):
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

        X = (xs - cx) * z / f
        Y = (ys - cy) * z / f

        dims = {"height": _extent_cm(Y), "width": _extent_cm(X)}
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
        # Tell the user WHY nothing was measured, instead of a flat dead end.
        candidates = raw_candidates(img)
        if candidates:
            top = sorted(candidates, key=lambda c: -c["conf"])[:3]
            names = ", ".join(f"{c['label']} ({c['conf']*100:.0f}%)" for c in top)
            warnings.append(
                f"No measurable objects detected. YOLO's best weak guesses were: {names}. "
                "Try a clearer angle, more of the object in frame, or better lighting."
            )
        else:
            warnings.append(
                "No objects detected at all. Try a clearer photo with the whole object visible, "
                "ideally from an angle that shows its recognizable shape (e.g. an open laptop, "
                "not just the closed lid)."
            )

    return {"scene": scene, "focal_source": f_src, "objects": objects, "warnings": warnings}