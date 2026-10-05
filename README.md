# 📏 SmartMeasure

**Estimate real-world object dimensions from a single photo — with or without a reference marker.**

![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python\&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi\&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react\&logoColor=white)
![OpenCV](https://img.shields.io/badge/OpenCV-4.8+-5C3EE8?logo=opencv\&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

---

## 📌 Overview

SmartMeasure is a computer vision application that estimates the real-world dimensions of objects from images.

It supports **three measurement modes**:

* 📏 **Precision Mode** — Uses a known-size ArUco marker for accurate measurements.
* 🤖 **AI Estimate Mode** — Uses object segmentation, depth estimation, camera geometry, and size priors.
* ✏️ **Manual Region Mode** — Allows users to manually select objects that are not recognized by the AI model.

---

## 🔧 How It Works

### 📏 Precision Mode

Uses an **ArUco marker** of known size placed in the same plane as the object.

OpenCV detects the marker and uses **homography** to compensate for perspective before converting pixel distances into millimeters.

**Typical accuracy:** ±1–3 cm

### 🤖 AI Estimate Mode

Combines:

* **YOLOv8-seg** — Object segmentation
* **Depth Anything V2** — Depth estimation
* **Camera geometry** — 3D back-projection using focal length
* **Size priors** — Typical object dimensions

The system returns an estimated measurement with a **confidence range** instead of pretending the result is perfectly accurate.

**Typical error:** 10–30%, depending on image conditions.

### ✏️ Manual Region Mode

For objects that are not recognized by YOLO, the user can manually select the object region. Depth and camera geometry are then used to estimate its dimensions.

---

## 🛠️ Tech Stack

* **Frontend:** React, Vite, React Router
* **Backend:** Python, FastAPI
* **Computer Vision:** OpenCV
* **Object Detection:** YOLOv8-seg
* **Depth Estimation:** Depth Anything V2
* **Numerical Computing:** NumPy
* **Testing:** Pytest

---

## 📁 Project Structure

```text
smart-measure/
├── smartmeasure/
│   ├── core/              # Marker detection & geometry
│   ├── estimation/        # YOLO, depth & measurement logic
│   └── api/               # FastAPI endpoints
├── frontend/              # React frontend
├── scripts/               # Utility scripts
├── tests/                 # Tests
├── eval/                  # Evaluation data
├── Dockerfile
└── requirements*.txt
```

---

## 🚀 Local Setup

### Backend

```bash
python -m venv venv
venv\Scripts\activate

pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
pip install -r requirements-dev.txt -r requirements-ml.txt
pip install -e .

python -m uvicorn smartmeasure.api.main:app --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

---

## 🧪 Testing

```bash
pytest
```

Tests cover the measurement geometry and estimation/fusion logic.

---

## ⚠️ Limitations

* AI estimates are approximate and depend heavily on image quality.
* Camera tilt can affect height measurements.
* Missing EXIF data can reduce accuracy.
* AI size priors only cover supported object classes.
* Precision Mode requires a correctly printed marker at the known scale.
* SmartMeasure is a **portfolio/research project**, not a certified measuring instrument.

