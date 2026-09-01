import { DitherRevealRenderer } from "./renderer";
import {
  DEFAULT_DITHER_OPTIONS,
  type DitherMode,
  type DitherMatrix,
  type DitherRevealOptions,
} from "./types";

const ATTRS = [
  "src",
  "mode",
  "radius",
  "softness",
  "pixel-size",
  "matrix",
  "ink",
  "paper",
  "brightness",
  "contrast",
  "shadows",
  "mids",
  "highlights",
  "follow",
] as const;

function num(value: string | null, fallback: number) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export class DitherRevealElement extends HTMLElement {
  static observedAttributes = [...ATTRS];

  private canvas = document.createElement("canvas");
  private video = document.createElement("video");
  private renderer: DitherRevealRenderer | null = null;
  private io: IntersectionObserver | null = null;
  private host: HTMLElement | null = null;

  constructor() {
    super();
    this.video.muted = true;
    this.video.loop = true;
    this.video.playsInline = true;
    this.video.preload = "auto";
    this.video.crossOrigin = "anonymous";
    this.video.setAttribute("muted", "");
    this.video.style.cssText =
      "position:absolute;width:1px;height:1px;opacity:0;pointer-events:none";
    this.canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%";
  }

  connectedCallback() {
    this.style.position = this.style.position || "absolute";
    this.style.inset = this.style.inset || "0";
    this.style.pointerEvents = "none";
    this.style.overflow = "hidden";
    this.append(this.video, this.canvas);

    try {
      this.renderer = new DitherRevealRenderer(this.canvas, this.video);
    } catch {
      return;
    }

    this.syncFromAttributes();
    this.bindHost();

    this.io = new IntersectionObserver(
      ([entry]) => {
        if (!this.renderer) return;
        if (entry?.isIntersecting) {
          void this.video.play().catch(() => undefined);
          this.renderer.start();
        } else {
          this.video.pause();
          this.renderer.stop();
        }
      },
      { threshold: 0.05 },
    );
    this.io.observe(this.canvas);
    void this.video.play().catch(() => undefined);
    this.renderer.start();
  }

  disconnectedCallback() {
    this.unbindHost();
    this.io?.disconnect();
    this.renderer?.destroy();
    this.renderer = null;
  }

  attributeChangedCallback() {
    if (this.renderer) this.syncFromAttributes();
  }

  private optionsFromAttributes(): DitherRevealOptions {
    const d = DEFAULT_DITHER_OPTIONS;
    const matrixRaw = num(this.getAttribute("matrix"), d.matrix);
    return {
      src: this.getAttribute("src") || d.src,
      mode: (this.getAttribute("mode") as DitherMode) || d.mode,
      radius: num(this.getAttribute("radius"), d.radius),
      softness: num(this.getAttribute("softness"), d.softness),
      pixelSize: num(this.getAttribute("pixel-size"), d.pixelSize),
      matrix: (matrixRaw === 4 ? 4 : 8) as DitherMatrix,
      ink: this.getAttribute("ink") || d.ink,
      paper: this.getAttribute("paper") || d.paper,
      brightness: num(this.getAttribute("brightness"), d.brightness),
      contrast: num(this.getAttribute("contrast"), d.contrast),
      shadows: num(this.getAttribute("shadows"), d.shadows),
      mids: num(this.getAttribute("mids"), d.mids),
      highlights: num(this.getAttribute("highlights"), d.highlights),
      follow: num(this.getAttribute("follow"), d.follow),
    };
  }

  private syncFromAttributes() {
    const options = this.optionsFromAttributes();
    if (this.video.getAttribute("src") !== options.src) {
      this.video.src = options.src;
      this.video.load();
    }
    this.renderer?.setOptions(options);
  }

  private onPointer = (event: PointerEvent) => {
    const rect = this.canvas.getBoundingClientRect();
    this.renderer?.setPointer(event.clientX - rect.left, event.clientY - rect.top);
  };

  private bindHost() {
    this.unbindHost();
    this.host = (this.parentElement as HTMLElement | null) ?? this;
    this.host.addEventListener("pointermove", this.onPointer, { passive: true });
    this.host.addEventListener("pointerdown", this.onPointer, { passive: true });
  }

  private unbindHost() {
    this.host?.removeEventListener("pointermove", this.onPointer);
    this.host?.removeEventListener("pointerdown", this.onPointer);
    this.host = null;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "dither-reveal": DitherRevealElement;
  }
}

export function defineDitherReveal() {
  if (typeof window === "undefined") return;
  if (!customElements.get("dither-reveal")) {
    customElements.define("dither-reveal", DitherRevealElement);
  }
}
