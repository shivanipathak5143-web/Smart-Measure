import cv2
import numpy as np
from smartmeasure.core.marker import marker_maker, detect_marker
from smartmeasure.core.geometry import build_homography, distance_mm

def test_known_distance():
    canvas=np.full((600,600),255,dtype=np.uint8)
    canvas[100:300, 100:300]=marker_maker(23,200)
    img=cv2.cvtColor(canvas,cv2.COLOR_GRAY2BGR)
    found=detect_marker(img)
    assert found is not None
    _, corners= found
    H=build_homography(corners,100.0)
    d=distance_mm(H,(100,100),(100,500))
    assert abs(d-200.0)<2.0
