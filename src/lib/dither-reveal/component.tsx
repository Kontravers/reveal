import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { DitherRevealRenderer } from "./renderer";
import { DEFAULT_DITHER_OPTIONS, type DitherRevealOptions } from "./types";

export type DitherRevealProps = Partial<DitherRevealOptions> & {
  src: string;
  className?: string;
};

export function DitherReveal({
  src,
  className,
  ...rest
}: DitherRevealProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const rendererRef = useRef<DitherRevealRenderer | null>(null);
  const options: DitherRevealOptions = {
    ...DEFAULT_DITHER_OPTIONS,
    ...rest,
    src,
    polygonPoints: rest.polygonPoints ?? DEFAULT_DITHER_OPTIONS.polygonPoints,
  };
  rendererRef.current?.setOptions(options);

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
    rendererRef.current?.setOptions(options);
  }, [options]);

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
