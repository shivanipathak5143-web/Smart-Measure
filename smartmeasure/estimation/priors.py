# (mean_cm, sd_cm) of typical size for upright objects, keyed by COCO label.
# STARTING VALUES from general knowledge. Replace with statistics computed
# from Objectron / ABO / your own data (see the datasets section).
PRIORS = {
    "person":       {"height": (165, 12)},
    "chair":        {"height": (90, 10)},
    "couch":        {"height": (85, 10), "width": (190, 35)},
    "dining table": {"height": (75, 4),  "width": (140, 35)},
    "refrigerator": {"height": (175, 20)},
    "bottle":       {"height": (24, 6)},
    "car":          {"height": (150, 15), "width": (185, 12)},
    "bicycle":      {"height": (100, 10)},
    "tv":           {"width": (100, 30)},
    "laptop":       {"width": (33, 3)},
}