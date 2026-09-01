import { useEffect, useRef, useState } from "react";
import {
  MAX_SHAPE_POINTS,
  cornerPoint,
  tessellatePath,
  type PathPoint,
  type Vec2,
} from "@kontravers/dither-reveal";
import { cn } from "@/lib/utils";

type PolygonEditorProps = {
  points: PathPoint[];
  selected: number;
  onSelect: (index: number) => void;
  onChange: (points: PathPoint[]) => void;
  onToggleBezier: (index: number) => void;
  className?: string;
};

type Drag =
  | { kind: "vertex"; index: number }
  | { kind: "hin"; index: number }
  | { kind: "hout"; index: number };

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

function clampLocal(p: Vec2): Vec2 {
  return {
    x: Math.min(1.2, Math.max(-1.2, p.x)),
    y: Math.min(1.2, Math.max(-1.2, p.y)),
  };
}

export function PolygonEditor({
  points,
  selected,
  onSelect,
  onChange,
  onToggleBezier,
  className,
}: PolygonEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragRef = useRef<Drag | null>(null);
  const lastClick = useRef(0);
  const [hover, setHover] = useState<Drag | null>(null);

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

    const curve = tessellatePath(points, 8);
    ctx.beginPath();
    curve.forEach((p, i) => {
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

    const sel = points[selected];
    if (sel?.kind === "bezier") {
      const origin = toCanvas(sel, css);
      const drawHandle = (rel: Vec2) => {
        const h = toCanvas({ x: sel.x + rel.x, y: sel.y + rel.y }, css);
        ctx.beginPath();
        ctx.moveTo(origin.x, origin.y);
        ctx.lineTo(h.x, h.y);
        ctx.strokeStyle = "rgba(20, 20, 19, 0.55)";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(h.x, h.y, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = "#e8e2d4";
        ctx.fill();
        ctx.strokeStyle = "#141413";
        ctx.stroke();
      };
      drawHandle(sel.hin);
      drawHandle(sel.hout);
    }

    points.forEach((p, i) => {
      const c = toCanvas(p, css);
      ctx.beginPath();
      if (p.kind === "bezier") {
        ctx.arc(c.x, c.y, i === selected ? 6 : 5, 0, Math.PI * 2);
      } else {
        const s = i === selected ? 5.5 : 4.5;
        ctx.rect(c.x - s, c.y - s, s * 2, s * 2);
      }
      ctx.fillStyle = i === selected ? "#141413" : "#2a2824";
      ctx.fill();
      if (i === selected) {
        ctx.strokeStyle = "#e8e2d4";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    });
  }, [points, selected, hover]);

  const hit = (cx: number, cy: number, size: number): Drag | null => {
    const sel = points[selected];
    if (sel?.kind === "bezier") {
      const handles: Drag[] = [
        { kind: "hin", index: selected },
        { kind: "hout", index: selected },
      ];
      for (const h of handles) {
        const rel = h.kind === "hin" ? sel.hin : sel.hout;
        const c = toCanvas({ x: sel.x + rel.x, y: sel.y + rel.y }, size);
        if (Math.hypot(c.x - cx, c.y - cy) < 12) return h;
      }
    }
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
    return best >= 0 ? { kind: "vertex", index: best } : null;
  };

  const onPointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const found = hit(x, y, rect.width);
    const now = Date.now();
    if (found?.kind === "vertex" && now - lastClick.current < 280 && found.index === selected) {
      onToggleBezier(found.index);
      lastClick.current = 0;
      return;
    }
    lastClick.current = now;
    if (found) {
      dragRef.current = found;
      if (found.kind === "vertex") onSelect(found.index);
      canvas.setPointerCapture(event.pointerId);
      return;
    }
    if (points.length < MAX_SHAPE_POINTS) {
      const local = clampLocal(toLocal(x, y, rect.width));
      const next = [...points, cornerPoint(local.x, local.y)];
      onChange(next);
      onSelect(next.length - 1);
      dragRef.current = { kind: "vertex", index: next.length - 1 };
      canvas.setPointerCapture(event.pointerId);
    }
  };

  const onPointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    if (!dragRef.current) {
      setHover(hit(x, y, rect.width));
      return;
    }
    const local = clampLocal(toLocal(x, y, rect.width));
    const drag = dragRef.current;
    const next = points.map((p, i) => {
      if (i !== drag.index) return p;
      if (drag.kind === "vertex") {
        return { ...p, x: local.x, y: local.y };
      }
      const rel = { x: local.x - p.x, y: local.y - p.y };
      const breakMirror = event.altKey;
      if (drag.kind === "hout") {
        return {
          ...p,
          hout: rel,
          hin: p.mirrored && !breakMirror ? { x: -rel.x, y: -rel.y } : p.hin,
          mirrored: breakMirror ? false : p.mirrored,
        };
      }
      return {
        ...p,
        hin: rel,
        hout: p.mirrored && !breakMirror ? { x: -rel.x, y: -rel.y } : p.hout,
        mirrored: breakMirror ? false : p.mirrored,
      };
    });
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
