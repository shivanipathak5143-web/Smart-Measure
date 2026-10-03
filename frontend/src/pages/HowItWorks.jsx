export default function HowItWorks() {
  return (
    <div>
      {/* Page header */}
      <div style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
        <div className="sm-container-narrow" style={{ padding: "28px 24px 24px" }}>
          <div className="sm-page-eyebrow">Documentation</div>
          <h1 className="sm-page-title">How SmartMeasure works</h1>
          <p className="sm-page-sub">
            The core problem: a photo only stores pixels, not centimeters.
            Here is how each mode converts pixels into real-world measurements.
          </p>
        </div>
      </div>

      <div className="sm-container-narrow" style={{ padding: "28px 24px 64px" }}>
        <article className="sm-article">
          <h2>Pixels are not centimeters</h2>
          <p>
            A camera does not record "this table is 75 cm tall." It records "this table is 820 pixels tall."
            Move the camera farther away and the same table might appear as 200 pixels.
            The physical table never changed — only its apparent size in the image did.
            Without additional information, there is no way to convert pixels back into real-world units.
          </p>
          <p>
            This is the fundamental problem both modes solve, each using a different source of physical scale information.
          </p>

          <h2>Precision Mode — a known ruler in the frame</h2>
          <p>
            If something of <em>known</em> real-world size appears in the photo, it functions as a ruler.
            An ArUco marker printed at exactly 100 mm might measure 200 pixels in a given photo — so in that photo,
            1 pixel equals 0.5 mm. Any other distance on the same plane can then be converted to real units.
          </p>
          <p>
            The constraint: the marker must lie on the <strong>same plane</strong> as whatever you are measuring.
            A marker on the floor cannot accurately scale a measurement on a tabletop at a different depth.
          </p>

          <h2>Homography — correcting for camera angle</h2>
          <p>
            Photograph the marker from an angle and it no longer looks like a perfect square — it becomes a
            trapezoid, because different corners sit at different distances from the camera.
            A homography transformation maps those four distorted corners back to a flat, straight-on square,
            similar to the way a phone document scanner "flattens" a photo of a tilted page.
            Once the homography is known, any two points on that same plane can be measured accurately
            regardless of camera distance or tilt.
          </p>

          <h2>AI Estimate — when no marker is available</h2>
          <p>
            Without a reference object, the pipeline uses three AI components working in combination:
          </p>
          <ul>
            <li>
              <strong>YOLOv8 segmentation</strong> — identifies which pixels belong to the object (chair, bottle,
              person) rather than just a bounding box. The pixel mask gives a more accurate object boundary.
            </li>
            <li>
              <strong>Monocular metric depth estimation</strong> (Depth Anything V2) — predicts how far
              each pixel is from the camera, in meters. This is an absolute distance estimate,
              not just a relative "closer/farther" comparison.
            </li>
            <li>
              <strong>Camera geometry</strong> — using the focal length read from the image's EXIF metadata,
              the system back-projects the object's pixels into 3D space, combining depth values with
              pixel positions to produce a raw geometric size estimate.
            </li>
          </ul>
          <p>
            The raw geometric estimate is then <strong>fused</strong> with a typical-size prior for the
            detected object class — a chair is usually around 90 cm tall, for example — using
            inverse-variance weighting. The result is a single estimate with an honest confidence range.
          </p>

          <h2>Why report a range instead of one number?</h2>
          <p>
            AI Estimate is genuinely uncertain — typically 10–30% off, depending on lighting,
            EXIF availability, and how unusual the object's framing is. Reporting "74 cm" with no
            qualification would be misleading. Reporting "72–78 cm, medium confidence" is honest
            about what the system actually knows.
          </p>

          <h2>What affects accuracy</h2>
          <ul>
            <li>
              <strong>EXIF focal length</strong> — forwarded or screenshotted photos strip EXIF data,
              removing the focal-length signal and lowering AI Estimate accuracy.
            </li>
            <li>
              <strong>Camera angle</strong> — AI Estimate assumes a roughly level camera.
              A strongly tilted shot skews the height axis.
            </li>
            <li>
              <strong>Marker plane</strong> — Precision Mode requires the marker on the same plane
              as the measurement target.
            </li>
            <li>
              <strong>Print scale</strong> — the ArUco marker must be printed at exactly 100% scale
              and the printed dimension entered accurately.
            </li>
            <li>
              <strong>Object class</strong> — AI Estimate only measures objects with a defined size prior.
              Unfamiliar framings may be missed.
            </li>
          </ul>
        </article>
      </div>
    </div>
  );
}
