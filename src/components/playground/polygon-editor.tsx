import { useEffect, useRef } from "react";
import { MAX_SHAPE_POINTS, type Vec2 } from "@/lib/dither-reveal/shape";
import { cn } from "@/lib/utils";

type PolygonEditorProps = {
  points: Vec2[];
  onChange: (points: Vec2[]) => void;
  className?: string;
};

function toLocal(cx: number, cy: number, size: number): Vec2 {
  return {
    x: (cx / size) * 2 - 1,
    y: (cy / size) * 2 - 1,
  };
}

function toCanvas(p: Vec2, size: number) {
  return {
    x: ((p.x + 1) / 2) * size,
    y: ((p.y + 1) / 2) * size,
  };
}

export function PolygonEditor({ points, onChange, className }: PolygonEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const css = canvas.getBoundingClientRect().width;
    canvas.width = Math.round(css * dpr);
    canvas.height = Math.round(css * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, css, css);
    ctx.fillStyle = "#ddd6c5";
    ctx.fillRect(0, 0, css, css);

    if (points.length < 2) return;
    ctx.beginPath();
    points.forEach((p, i) => {
      const c = toCanvas(p, css);
      if (i === 0) ctx.moveTo(c.x, c.y);
      else ctx.lineTo(c.x, c.y);
    });
    ctx.closePath();
    ctx.fillStyle = "rgba(20, 20, 19, 0.12)";
    ctx.fill();
    ctx.strokeStyle = "#141413";
    ctx.lineWidth = 1.25;
    ctx.stroke();

    points.forEach((p) => {
      const c = toCanvas(p, css);
      ctx.beginPath();
      ctx.arc(c.x, c.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#141413";
      ctx.fill();
    });
  }, [points]);

  const hitIndex = (cx: number, cy: number, size: number) => {
    let best = -1;
    let bestD = 14;
    points.forEach((p, i) => {
      const c = toCanvas(p, size);
      const d = Math.hypot(c.x - cx, c.y - cy);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    return best;
  };

  const onPointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const hit = hitIndex(x, y, rect.width);
    if (hit >= 0) {
      dragRef.current = hit;
      canvas.setPointerCapture(event.pointerId);
      return;
    }
    if (points.length < MAX_SHAPE_POINTS) {
      const next = [...points, toLocal(x, y, rect.width)];
      onChange(next);
      dragRef.current = next.length - 1;
      canvas.setPointerCapture(event.pointerId);
    }
  };

  const onPointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (dragRef.current === null) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const local = toLocal(event.clientX - rect.left, event.clientY - rect.top, rect.width);
    const clamped = {
      x: Math.min(1.15, Math.max(-1.15, local.x)),
      y: Math.min(1.15, Math.max(-1.15, local.y)),
    };
    const next = points.map((p, i) => (i === dragRef.current ? clamped : p));
    onChange(next);
  };

  const onPointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
    dragRef.current = null;
    canvasRef.current?.releasePointerCapture(event.pointerId);
  };

  return (
    <canvas
      ref={canvasRef}
      className={cn(
        "aspect-square w-full touch-none rounded-xl bg-paper-2",
        className,
      )}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    />
  );
}
