import numpy as np
import torch
from PIL import Image
from transformers import AutoImageProcessor, AutoModelForDepthEstimation

# Indoor model: trained on synthetic indoor data (Hypersim).
# Outdoor: Virtual KITTI.
# Verify these IDs on huggingface.co/depth-anything if a download fails.
MODELS = {
    "indoor": "depth-anything/Depth-Anything-V2-Metric-Indoor-Small-hf",
    "outdoor": "depth-anything/Depth-Anything-V2-Metric-Outdoor-Small-hf",
}


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
        """Returns depth in metres, shape (H, W)."""
        proc, model = self._load(scene)
        h, w = img_rgb.shape[:2]
        inputs = proc(images=Image.fromarray(img_rgb), return_tensors="pt")
        out = model(**inputs).predicted_depth  # (1, h', w')
        depth = torch.nn.functional.interpolate(
            out.unsqueeze(1), size=(h, w), mode="bicubic", align_corners=False
        )[0, 0]
        return depth.clamp(min=0).cpu().numpy()