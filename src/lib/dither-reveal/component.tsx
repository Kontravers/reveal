import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { DitherRevealRenderer } from "./renderer";
import type { DitherMatrix, DitherMode } from "./types";

export type DitherRevealProps = {
  src: string;
  mode?: DitherMode;
  radius?: number;
  softness?: number;
  pixelSize?: number;
  matrix?: DitherMatrix;
  ink?: string;
  paper?: string;
  brightness?: number;
  contrast?: number;
  shadows?: number;
  mids?: number;
  highlights?: number;
  follow?: number;
  className?: string;
};

export function DitherReveal({
  src,
  mode = "dither",
  radius = 220,
  softness = 90,
  pixelSize = 3,
  matrix = 8,
  ink = "#141413",
  paper = "#e8e2d4",
  brightness = 0,
  contrast = 1,
  shadows = 0,
  mids = 0,
  highlights = 0,
  follow = 0.2,
  className,
}: DitherRevealProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const rendererRef = useRef<DitherRevealRenderer | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !video || !wrap) return;

    const renderer = new DitherRevealRenderer(canvas, video);
    rendererRef.current = renderer;

    const host = wrap.parentElement ?? wrap;
    const onPointer = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      renderer.setPointer(event.clientX - rect.left, event.clientY - rect.top);
    };
    host.addEventListener("pointermove", onPointer, { passive: true });
    host.addEventListener("pointerdown", onPointer, { passive: true });

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          void video.play().catch(() => undefined);
          renderer.start();
        } else {
          video.pause();
          renderer.stop();
        }
      },
      { threshold: 0.05 },
    );
    io.observe(wrap);

    const onReady = () => {
      void video.play().catch(() => undefined);
      renderer.start();
    };
    video.addEventListener("loadeddata", onReady);
    if (video.readyState >= 2) onReady();

    return () => {
      host.removeEventListener("pointermove", onPointer);
      host.removeEventListener("pointerdown", onPointer);
      video.removeEventListener("loadeddata", onReady);
      io.disconnect();
      renderer.destroy();
      rendererRef.current = null;
    };
  }, []);

  useEffect(() => {
    rendererRef.current?.setOptions({
      src,
      mode,
      radius,
      softness,
      pixelSize,
      matrix,
      ink,
      paper,
      brightness,
      contrast,
      shadows,
      mids,
      highlights,
      follow,
    });
  }, [
    src,
    mode,
    radius,
    softness,
    pixelSize,
    matrix,
    ink,
    paper,
    brightness,
    contrast,
    shadows,
    mids,
    highlights,
    follow,
  ]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.getAttribute("src") !== src) {
      video.src = src;
      video.load();
    }
  }, [src]);

  return (
    <div
      ref={wrapRef}
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
      aria-hidden="true"
    >
      <video
        ref={videoRef}
        src={src}
        muted
        loop
        playsInline
        preload="auto"
        crossOrigin="anonymous"
        className="pointer-events-none absolute h-px w-px opacity-0"
      />
      <canvas ref={canvasRef} className="absolute inset-0 size-full" />
    </div>
  );
}
