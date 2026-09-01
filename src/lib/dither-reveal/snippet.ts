import type { DitherRevealOptions } from "./types";

export function reactSnippet(options: DitherRevealOptions) {
  return `<section className="relative min-h-[70vh] overflow-hidden bg-[#e8e2d4]">
  <DitherReveal
    src="${options.src}"
    mode="${options.mode}"
    radius={${Math.round(options.radius)}}
    softness={${Math.round(options.softness)}}
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
  return `<section style="position:relative;min-height:70vh;overflow:hidden;background:${options.paper}">
  <dither-reveal
    src="${options.src}"
    mode="${options.mode}"
    radius="${Math.round(options.radius)}"
    softness="${Math.round(options.softness)}"
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
