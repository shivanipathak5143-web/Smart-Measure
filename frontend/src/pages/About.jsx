export default function About() {
  return (
    <div>
      {/* Page header */}
      <div style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
        <div className="sm-container-narrow" style={{ padding: "28px 24px 24px" }}>
          <div className="sm-page-eyebrow">About</div>
          <h1 className="sm-page-title">About SmartMeasure</h1>
          <p className="sm-page-sub">
            A computer vision project for estimating real-world object dimensions from photographs,
            built as two complementary measurement modes rather than one black-box system.
          </p>
        </div>
      </div>

      <div className="sm-container-narrow" style={{ padding: "28px 24px 64px" }}>
        <article className="sm-article">
          <h2>What SmartMeasure does</h2>
          <p>
            SmartMeasure estimates the physical dimensions — width, height, depth — of objects
            appearing in a single photograph. It combines image processing, object segmentation,
            monocular depth estimation, and reference geometry into two distinct measurement modes:
          </p>
          <ul>
            <li>
              <strong>AI Estimate</strong> — works with any ordinary photo, no printed marker required.
              Uses machine learning models to infer object scale from image content and camera properties.
            </li>
            <li>
              <strong>Precision Mode</strong> — requires a printed ArUco reference marker placed in the frame.
              Uses known marker geometry and homography to measure distances on the marker's plane
              with greater accuracy.
            </li>
          </ul>

          <h2>Tech stack</h2>
          <ul>
            <li><strong>Backend:</strong> Python, FastAPI, OpenCV</li>
            <li>
              <strong>Computer vision models:</strong> YOLOv8-seg (Ultralytics),
              Depth Anything V2 Metric (Hugging Face Transformers)
            </li>
            <li><strong>Frontend:</strong> React (Vite), React Router</li>
            <li><strong>Deployment:</strong> Docker, AWS EC2 + S3 + CloudFront</li>
          </ul>

          <h2>Architecture</h2>
          <p>
            Two independent measurement engines sit behind one API:
          </p>
          <ul>
            <li>
              <code>/api/measure</code> — marker-based precision mode. Pure geometry, no ML inference.
              Detects the ArUco marker, computes homography, and converts clicked pixel segments
              to real-world distances.
            </li>
            <li>
              <code>/api/estimate</code> — marker-free estimation mode. YOLO segmentation, depth model
              inference, and size prior fusion, run in parallel for throughput.
            </li>
          </ul>

          <h2>Evaluation</h2>
          <p>
            Accuracy is measured against a self-collected, tape-measured dataset of everyday objects —
            chairs, bottles, laptops, people — photographed at varied distances and camera angles.
            Reported metrics include mean absolute percentage error (MAPE) by object class,
            by distance, and by tilt; and range coverage (the share of true values that fall inside
            the reported confidence range — target: ~95%).
          </p>

          <h2>Known limitations</h2>
          <ul>
            <li>
              AI Estimate assumes a roughly level camera. A strongly tilted shot skews the height axis.
            </li>
            <li>
              Forwarded or screenshotted photos strip EXIF data, removing the focal-length signal
              and reducing AI Estimate accuracy.
            </li>
            <li>
              Only object classes with a defined size prior are measured. Unusual framings
              (e.g. a closed laptop lid photographed from above) may be missed or misidentified.
            </li>
            <li>
              Precision Mode requires the marker to be printed at exactly the stated size and placed
              on the same plane as the measurement target.
            </li>
            <li>
              SmartMeasure is a portfolio and research project, not a certified measuring instrument.
            </li>
          </ul>
        </article>
      </div>
    </div>
  );
}
