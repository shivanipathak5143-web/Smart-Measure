<div align="center">

# 📏 SmartMeasure

**Estimate real-world object dimensions from a single photo — with or without a reference marker.**

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![OpenCV](https://img.shields.io/badge/OpenCV-4.8+-5C3EE8?logo=opencv&logoColor=white)](https://opencv.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[Live Demo](#) · [How It Works](#-how-it-works) · [Setup](#local-setup) · [Evaluation](#evaluation-methodology)

![SmartMeasure demo](docs/demo.gif)
<!-- Replace docs/demo.gif with a screen recording: upload a photo → see the estimate appear -->

</div>

---

### The problem

A photograph only stores pixels, not centimeters. Move the camera and the same object looks a completely different size — so no camera can measure real-world dimensions from a single image without extra information.

### What SmartMeasure does about it

| Mode | How | Accuracy |
|---|---|---|
| 📏 **Precision** | Printed ArUco marker + homography | ±1–3 cm |
| 🤖 **AI Estimate** | YOLOv8 segmentation + metric depth + size priors, fused with a reported confidence range | 10–30% |
| ✏️ **Manual Region** | User-drawn box + depth, for objects outside YOLO's known categories | geometry-only |

Rather than one black-box number, SmartMeasure tells you **how confident it is and why** — including automatically detecting and flagging studio/product-style photos where monocular depth has nothing reliable to read.

### Quick start

```bash
# backend
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
pip install -r requirements-dev.txt -r requirements-ml.txt && pip install -e .
python -m uvicorn smartmeasure.api.main:app --port 8000

# frontend
cd frontend && npm install && npm run dev
```

Full setup, architecture, and evaluation methodology below ↓

---
