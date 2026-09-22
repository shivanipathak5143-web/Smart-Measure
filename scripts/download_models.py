from smartmeasure.estimation.depth import MODELS
from transformers import AutoImageProcessor, AutoModelForDepthEstimation
from ultralytics import YOLO

for name in MODELS.values():
    AutoImageProcessor.from_pretrained(name)
    AutoModelForDepthEstimation.from_pretrained(name)
YOLO("yolov8n-seg.pt")
print("models cached")