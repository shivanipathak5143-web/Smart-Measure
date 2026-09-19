import cv2
import numpy as np

ARUCO_DICT=cv2.aruco.DICT_4X4_50

def marker_maker(marker_id:int=23,side_px:int =600)-> np.ndarray:
    dictionary=cv2.aruco.getPredefinedDictionary(ARUCO_DICT)
    return cv2.aruco.generateImageMarker(dictionary,marker_id,side_px)

def detect_marker(img_bgr:np.ndarray, marker_id:int|None=None):
    """Return (id, corners[4X2]) or None. Corner order: TL, TR, BR, BL."""
    dictionary=cv2.aruco.getPredefinedDictionary(ARUCO_DICT)
    detector=cv2.aruco.ArucoDetector(dictionary,cv2.aruco.DetectorParameters())
    corners, ids, _=detector.detectMarkers(img_bgr)
    if ids is None:
        return None
    for c, i in zip(corners, ids.flatten()):
        if marker_id is None or int(i)==marker_id:
            return int(i), c.reshape(4,2)
    return None