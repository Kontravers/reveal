import type { DitherRevealOptions } from "./types";

export function reactSnippet(options: DitherRevealOptions) {
  const points =
    options.shape === "polygon"
      ? `\n    polygonPoints={${JSON.stringify(
          options.polygonPoints.map((p) => ({
            x: Number(p.x.toFixed(3)),
            y: Number(p.y.toFixed(3)),
            kind: p.kind,
            hin: { x: Number(p.hin.x.toFixed(3)), y: Number(p.hin.y.toFixed(3)) },
            hout: { x: Number(p.hout.x.toFixed(3)), y: Number(p.hout.y.toFixed(3)) },
            mirrored: p.mirrored,
          })),
        )}}`
      : "";
  return `<section className="relative min-h-[70vh] overflow-hidden bg-[#e8e2d4]">
  <DitherReveal
    src="${options.src}"
    mode="${options.mode}"
    shape="${options.shape}"
    sides={${options.sides}}
    rectAspect={${options.rectAspect.toFixed(2)}}
    ngonCurve={${options.ngonCurve.toFixed(2)}}
    radius={${Math.round(options.radius)}}
    softness={${Math.round(options.softness)}}
    rotation={${Math.round(options.rotation)}}
    rotationSpeed={${options.rotationSpeed.toFixed(2)}}
    wiggleMode="${options.wiggleMode}"
    wigglePosAmount={${Math.round(options.wigglePosAmount)}}
    wigglePosSpeed={${options.wigglePosSpeed.toFixed(2)}}
    wiggleRotAmount={${Math.round(options.wiggleRotAmount)}}
    wiggleRotSpeed={${options.wiggleRotSpeed.toFixed(2)}}
    wigglePointsAmount={${Math.round(options.wigglePointsAmount)}}
    wigglePointsSpeed={${options.wigglePointsSpeed.toFixed(2)}}${points}
    pixelSize={${options.pixelSize}}
    matrix={${options.matrix}}
    ink="${options.ink}"
    paper="${options.paper}"
    brightness={${options.brightness.toFixed(2)}}
    contrast={${options.contrast.toFixed(2)}}
    shadows={${options.shadows.toFixed(2)}}
    mids={${options.mids.toFixed(2)}}
    highlights={${options.highlights.toFixed(2)}}
  />
  {/* Your content sits above. The lens follows the pointer. */}
</section>`;
}

export function htmlSnippet(options: DitherRevealOptions) {
  const points =
    options.shape === "polygon"
      ? `\n    points='${JSON.stringify(
          options.polygonPoints.map((p) => ({
            x: Number(p.x.toFixed(3)),
            y: Number(p.y.toFixed(3)),
            kind: p.kind,
            hin: { x: Number(p.hin.x.toFixed(3)), y: Number(p.hin.y.toFixed(3)) },
            hout: { x: Number(p.hout.x.toFixed(3)), y: Number(p.hout.y.toFixed(3)) },
            mirrored: p.mirrored,
          })),
        )}'`
      : "";
  return `<section style="position:relative;min-height:70vh;overflow:hidden;background:${options.paper}">
  <dither-reveal
    src="${options.src}"
    mode="${options.mode}"
    shape="${options.shape}"
    sides="${options.sides}"
    rect-aspect="${options.rectAspect.toFixed(2)}"
    ngon-curve="${options.ngonCurve.toFixed(2)}"
    radius="${Math.round(options.radius)}"
    softness="${Math.round(options.softness)}"
    rotation="${Math.round(options.rotation)}"
    rotation-speed="${options.rotationSpeed.toFixed(2)}"
    wiggle-mode="${options.wiggleMode}"
    wiggle-pos-amount="${Math.round(options.wigglePosAmount)}"
    wiggle-pos-speed="${options.wigglePosSpeed.toFixed(2)}"
    wiggle-rot-amount="${Math.round(options.wiggleRotAmount)}"
    wiggle-rot-speed="${options.wiggleRotSpeed.toFixed(2)}"
    wiggle-points-amount="${Math.round(options.wigglePointsAmount)}"
    wiggle-points-speed="${options.wigglePointsSpeed.toFixed(2)}"${points}
    pixel-size="${options.pixelSize}"
    matrix="${options.matrix}"
    ink="${options.ink}"
    paper="${options.paper}"
    brightness="${options.brightness.toFixed(2)}"
    contrast="${options.contrast.toFixed(2)}"
    shadows="${options.shadows.toFixed(2)}"
    mids="${options.mids.toFixed(2)}"
    highlights="${options.highlights.toFixed(2)}"
  ></dither-reveal>
</section>`;
}
