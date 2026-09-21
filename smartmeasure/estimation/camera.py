import io
import math
from PIL import Image

DIAG_35MM=43.27
DEFAULT_F35=26.0

def focal_px(data:bytes, width:int, height:int):
    """Focal length in pixels for an image of size width x heigh.
    Uses EXIF FocalLengthIn35mmFilm. Returns (f_px, source)."""
    f35, source= DEFAULT_F35, "default_26mm"
    try:
        exif=Image.open(io.BytesIO(data)).getexif()
        v=exif.get_ifd(0X8769).get(0XA405)
        if v and float(v)>0:
            f35, source=float(v), "exif"
    except Exception:
        pass
    
    return f35*math.hypot(width,height)/ DIAG_35MM, source