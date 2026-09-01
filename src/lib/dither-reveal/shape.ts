export const MAX_SHAPE_POINTS = 12;
export const MAX_TESS_POINTS = 64;
export const TESS_STEPS = 5;

export type Vec2 = { x: number; y: number };
export type PathPoint = {
  x: number;
  y: number;
  kind: "corner" | "bezier";
  hin: Vec2;
  hout: Vec2;
  mirrored: boolean;
};
export type LensShape =
  | "circle"
  | "square"
  | "rectangle"
  | "triangle"
  | "ngon"
  | "polygon";
export type WiggleMode = "loop" | "zigzag";

export const SHAPE_LABEL: Record<LensShape, string> = {
  circle: "Circle",
  square: "Square",
  rectangle: "Rect",
  triangle: "Tri",
  ngon: "N-gon",
  polygon: "Poly",
};

export function vec(x = 0, y = 0): Vec2 {
  return { x, y };
}

export function cornerPoint(x: number, y: number): PathPoint {
  return { x, y, kind: "corner", hin: vec(), hout: vec(), mirrored: true };
}

export function asPathPoint(raw: Partial<PathPoint> & Vec2): PathPoint {
  return {
    x: raw.x,
    y: raw.y,
    kind: raw.kind === "bezier" ? "bezier" : "corner",
    hin: raw.hin ? { x: raw.hin.x, y: raw.hin.y } : vec(),
    hout: raw.hout ? { x: raw.hout.x, y: raw.hout.y } : vec(),
    mirrored: raw.mirrored !== false,
  };
}

export function normalizePoints(points: Array<Vec2 | PathPoint>): PathPoint[] {
  return points
    .filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y))
    .slice(0, MAX_SHAPE_POINTS)
    .map((p) => asPathPoint(p));
}

export function regularPolygon(count: number, turn = -Math.PI / 2): PathPoint[] {
  const n = Math.min(MAX_SHAPE_POINTS, Math.max(3, Math.round(count)));
  const pts: PathPoint[] = [];
  for (let i = 0; i < n; i++) {
    const a = turn + (i * Math.PI * 2) / n;
    pts.push(cornerPoint(Math.cos(a), Math.sin(a)));
  }
  return pts;
}

export function rectanglePoints(aspect: number): PathPoint[] {
  const a = Math.min(3, Math.max(0.35, aspect));
  const halfW = a >= 1 ? 1 : a;
  const halfH = a >= 1 ? 1 / a : 1;
  return [
    cornerPoint(-halfW, -halfH),
    cornerPoint(halfW, -halfH),
    cornerPoint(halfW, halfH),
    cornerPoint(-halfW, halfH),
  ];
}

export function ngonPath(count: number, curve: number): PathPoint[] {
  const pts = regularPolygon(count);
  const t = Math.min(1, Math.max(0, curve));
  if (t <= 0.001) return pts;
  const n = pts.length;
  const handleLen = ((4 / 3) * Math.tan(Math.PI / (2 * n))) * t;
  return pts.map((p, i) => {
    const a = -Math.PI / 2 + (i * Math.PI * 2) / n;
    const tx = -Math.sin(a);
    const ty = Math.cos(a);
    return {
      ...p,
      kind: "bezier" as const,
      mirrored: true,
      hout: { x: tx * handleLen, y: ty * handleLen },
      hin: { x: -tx * handleLen, y: -ty * handleLen },
    };
  });
}

export function autoHandles(points: PathPoint[], index: number): { hin: Vec2; hout: Vec2 } {
  const n = points.length;
  const prev = points[(index - 1 + n) % n];
  const next = points[(index + 1) % n];
  const cur = points[index];
  if (!prev || !next || !cur) return { hin: vec(), hout: vec() };
  const dx = next.x - prev.x;
  const dy = next.y - prev.y;
  const len = Math.hypot(dx, dy) || 1;
  const tx = dx / len;
  const ty = dy / len;
  const kIn = Math.hypot(cur.x - prev.x, cur.y - prev.y) / 3;
  const kOut = Math.hypot(next.x - cur.x, next.y - cur.y) / 3;
  return {
    hin: { x: -tx * kIn, y: -ty * kIn },
    hout: { x: tx * kOut, y: ty * kOut },
  };
}

export function toggleBezier(points: PathPoint[], index: number): PathPoint[] {
  return points.map((p, i) => {
    if (i !== index) return p;
    if (p.kind === "bezier") {
      return { ...p, kind: "corner" as const, hin: vec(), hout: vec(), mirrored: true };
    }
    const handles = autoHandles(points, i);
    return { ...p, kind: "bezier" as const, ...handles, mirrored: true };
  });
}

export function bezierAll(points: PathPoint[]): PathPoint[] {
  return points.map((p, i) => {
    if (p.kind === "bezier") return p;
    const handles = autoHandles(points, i);
    return { ...p, kind: "bezier" as const, ...handles, mirrored: true };
  });
}

function lerp(a: Vec2, b: Vec2, t: number): Vec2 {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

function cubic(p0: Vec2, p1: Vec2, p2: Vec2, p3: Vec2, t: number): Vec2 {
  const a = lerp(p0, p1, t);
  const b = lerp(p1, p2, t);
  const c = lerp(p2, p3, t);
  return lerp(lerp(a, b, t), lerp(b, c, t), t);
}

export function tessellatePath(points: PathPoint[], steps = TESS_STEPS): Vec2[] {
  const n = points.length;
  if (n < 2) return points.map((p) => ({ x: p.x, y: p.y }));
  const out: Vec2[] = [];
  for (let i = 0; i < n; i++) {
    const a = points[i];
    const b = points[(i + 1) % n];
    if (!a || !b) continue;
    const curved = a.kind === "bezier" || b.kind === "bezier";
    if (!curved) {
      out.push({ x: a.x, y: a.y });
      continue;
    }
    const p0 = { x: a.x, y: a.y };
    const p1 =
      a.kind === "bezier"
        ? { x: a.x + a.hout.x, y: a.y + a.hout.y }
        : p0;
    const p3 = { x: b.x, y: b.y };
    const p2 =
      b.kind === "bezier"
        ? { x: b.x + b.hin.x, y: b.y + b.hin.y }
        : p3;
    const seg = Math.max(2, steps);
    for (let s = 0; s < seg; s++) {
      out.push(cubic(p0, p1, p2, p3, s / seg));
      if (out.length >= MAX_TESS_POINTS) return out;
    }
  }
  return out.slice(0, MAX_TESS_POINTS);
}

export function localPoints(input: {
  shape: LensShape;
  sides: number;
  rectAspect: number;
  ngonCurve: number;
  polygonPoints: PathPoint[];
}): PathPoint[] {
  switch (input.shape) {
    case "square":
      return rectanglePoints(1);
    case "rectangle":
      return rectanglePoints(input.rectAspect);
    case "triangle":
      return regularPolygon(3);
    case "ngon":
      return ngonPath(input.sides, input.ngonCurve);
    case "polygon": {
      const pts = normalizePoints(input.polygonPoints);
      return pts.length >= 3 ? pts : regularPolygon(6);
    }
    default:
      return [];
  }
}

export function oscillator(cycles: number, mode: WiggleMode): number {
  if (mode === "zigzag") {
    const x = cycles - Math.floor(cycles);
    return x < 0.5 ? x * 4 - 1 : 3 - x * 4;
  }
  return Math.sin(cycles * Math.PI * 2);
}

export function worldLensPoints(input: {
  shape: LensShape;
  sides: number;
  rectAspect: number;
  ngonCurve: number;
  polygonPoints: PathPoint[];
  radius: number;
  rotation: number;
  rotationSpeed: number;
  wigglePosAmount: number;
  wigglePosSpeed: number;
  wiggleRotAmount: number;
  wiggleRotSpeed: number;
  wigglePointsAmount: number;
  wigglePointsSpeed: number;
  wiggleMode: WiggleMode;
  cursorX: number;
  cursorY: number;
  time: number;
}): { centerX: number; centerY: number; points: Vec2[]; count: number } {
  const wave = (speed: number, phase: number) =>
    speed === 0 ? 0 : oscillator(input.time * speed + phase, input.wiggleMode);

  const centerX = input.cursorX + input.wigglePosAmount * wave(input.wigglePosSpeed, 0);
  const centerY =
    input.cursorY + input.wigglePosAmount * wave(input.wigglePosSpeed, 0.27);
  const rotDeg =
    input.rotation +
    input.rotationSpeed * input.time * 360 +
    input.wiggleRotAmount * wave(input.wiggleRotSpeed, 0.11);
  const rad = (rotDeg * Math.PI) / 180;
  const cr = Math.cos(rad);
  const sr = Math.sin(rad);

  const rotateScale = (x: number, y: number) => ({
    x: x * cr - y * sr,
    y: x * sr + y * cr,
  });

  const local = localPoints(input);
  const world: PathPoint[] = local.map((p, i) => {
    const jx = input.wigglePointsAmount * wave(input.wigglePointsSpeed, i * 0.17);
    const jy =
      input.wigglePointsAmount * wave(input.wigglePointsSpeed, i * 0.17 + 0.31);
    const pos = rotateScale(p.x * input.radius + jx, p.y * input.radius + jy);
    const hin = rotateScale(p.hin.x * input.radius, p.hin.y * input.radius);
    const hout = rotateScale(p.hout.x * input.radius, p.hout.y * input.radius);
    return {
      x: centerX + pos.x,
      y: centerY + pos.y,
      kind: p.kind,
      hin,
      hout,
      mirrored: p.mirrored,
    };
  });

  const points = tessellatePath(world);
  return { centerX, centerY, points, count: points.length };
}
