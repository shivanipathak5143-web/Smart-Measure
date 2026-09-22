import math

def fuse(geo_cm: float, geo_rel_sigma: float, prior: tuple | None):
    """Inverse-variance weighted average of the geometry estimate and the prior.
    Returns (mean, sigma, notes)."""
    s_geo = max(geo_cm * geo_rel_sigma, 1e-6)
    notes = []
    if prior is None:
        return geo_cm, s_geo, notes

    p_mean, p_sd = prior
    w_geo, w_pri = 1 / s_geo**2, 1 / p_sd**2
    mean = (w_geo * geo_cm + w_pri * p_mean) / (w_geo + w_pri)
    sigma = math.sqrt(1 / (w_geo + w_pri))

    # If the two disagree wildly, something is off (odd object, bad depth, tilt)
    z = abs(geo_cm - p_mean) / math.hypot(s_geo, p_sd)
    if z > 3:
        notes.append("Geometry and typical-size prior disagree strongly; treat with caution.")
    return mean, sigma, notes


def confidence(sigma: float, mean: float, truncated: bool, exif_ok: bool) -> str:
    rel = sigma / max(mean, 1e-6)
    level = 2 if rel < 0.10 else 1 if rel < 0.20 else 0
    if truncated:
        level = 0
    if not exif_ok:
        level = min(level, 1)
    return ["low", "medium", "high"][level]