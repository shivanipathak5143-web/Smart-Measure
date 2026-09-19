import cv2
from smartmeasure.core.marker import make_marker

marker=make_marker(marker_id=23, side_px=800)
cv2.imwrite("marker_id23.png",marker)
print("Saved marker_id23.png")