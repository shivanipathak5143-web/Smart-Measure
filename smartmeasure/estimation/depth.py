import os

import numpy as np
import torch
from PIL import Image
from transformers import AutoImageProcessor, AutoModelForDepthEstimation

# Indoor model: trained on synthetic indoor data (Hypersim).
# Outdoor: Virtual KITTI.
MODELS = {
    "indoor": "depth-anything/Depth-Anything-V2-Metric-Indoor-Small-hf",
    "outdoor": "depth-anything/Depth-Anything-V2-Metric-Outdoor-Small-hf",
}

# Depth only needs enough resolution to capture the object's rough shape —
# feeding it the same 1024px used for detection wastes compute for no
# real accuracy gain in the final size estimate.
DEPTH_SIDE = 518  # matches this model's native training resolution

torch.set_num_threads(os.cpu_count() or 4)


class DepthEstimator:
    def __init__(self):
        self._cache = {}

    def _load(self, scene: str):
        if scene not in self._cache:
            name = MODELS[scene]
            proc = AutoImageProcessor.from_pretrained(name)
            model = AutoModelForDepthEstimation.from_pretrained(name).eval()
            self._cache[scene] = (proc, model)
        return self._cache[scene]

    @torch.inference_mode()
    def predict(self, img_rgb: np.ndarray, scene: str) -> np.ndarray:
        """Returns depth in metres, shape (H, W) — matches img_rgb's original size."""
        proc, model = self._load(scene)
        h, w = img_rgb.shape[:2]

        small = Image.fromarray(img_rgb).resize(
            self._fit(w, h, DEPTH_SIDE), Image.BILINEAR
        )
        inputs = proc(images=small, return_tensors="pt")
        out = model(**inputs).predicted_depth  # (1, h', w')

        depth = torch.nn.functional.interpolate(
            out.unsqueeze(1), size=(h, w), mode="bicubic", align_corners=False
        )[0, 0]
        return depth.clamp(min=0).cpu().numpy()

    @staticmethod
    def _fit(w, h, side):
        scale = side / max(w, h)
        return (max(1, round(w * scale)), max(1, round(h * scale)))