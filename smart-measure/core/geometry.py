import cv2
import numpy as np

def build_homography(corners_px, marker_size_mm:float)-> np.ndarray:
    """Map image pixels on the marker's plane to millimeters."""
    src=np.asarray(corners_px,dtype=np.float32).reshape(4,2)
    s=float(marker_size_mm)
    dst=np.array([[0,0],[s,0],[s,s],[0,s]], dtype=np.float32)
    return cv2.getPerspectiveTransform(src,dst)

def px_to_mm(H:np.ndarray, points_px) -> np.ndarray:
    pts=np.asarray(points_px,dtype=np.float32).reshape(-1,1,2)
    return cv2.perspectiveTransform(pts,H).reshape(-1,2)

def distance_mm(H: np.ndarray, p1,p2)-> float:
    a,b=px_to_mm(H,[p1,p2])
    return np.linalg.norm(a-b)

def marker_quality(corners_px,marker_size_mm:float)->dict:
    """simple sanity metrics: how tilted/ how large the marker appears."""
    c=np.asarray(corners_px,dtype=np.float32).reshape(4,2)
    sides=[np.linalg.norm(c[i]-c[(i+1)%4]) for i in range(4)]
    return{
        "px_per_mm":float(np.mean(sides)/marker_size_mm),
        "sides_ratio":float(max(sides)/min(sides)),
    }