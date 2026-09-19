import io
import cv2
import numpy as np
from PIL import Image,ImageOps

def decode_image(data:bytes) -> np.ndarray:
    """
    Bytes-> BGR image, with phone EXIF rotation applied."""
    img=Image.open(io.BytesIO(data))
    img=ImageOps.exif_transpose(img).convert("RGB")
    return cv2.cvtColor(np.array(img),cv2.COLOR_RGB2BGR)