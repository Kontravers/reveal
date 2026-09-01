export const MAX_SHAPE_POINTS = 12;

export type Vec2 = { x: number; y: number };
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

export function regularPolygon(count: number, turn = -Math.PI / 2): Vec2[] {
  const n = Math.min(MAX_SHAPE_POINTS, Math.max(3, Math.round(count)));
  const pts: Vec2[] = [];
  for (let i = 0; i < n; i++) {
    const a = turn + (i * Math.PI * 2) / n;
    pts.push({ x: Math.cos(a), y: Math.sin(a) });
  }
  return pts;
}

export function rectanglePoints(aspect: number): Vec2[] {
  const a = Math.min(3, Math.max(0.35, aspect));
  const halfW = a >= 1 ? 1 : a;
  const halfH = a >= 1 ? 1 / a : 1;
  return [
    { x: -halfW, y: -halfH },
    { x: halfW, y: -halfH },
    { x: halfW, y: halfH },
    { x: -halfW, y: halfH },
  ];
}

export function localPoints(input: {
  shape: LensShape;
  sides: number;
  rectAspect: number;
  polygonPoints: Vec2[];
}): Vec2[] {
  switch (input.shape) {
    case "square":
      return rectanglePoints(1);
    case "rectangle":
      return rectanglePoints(input.rectAspect);
    case "triangle":
      return regularPolygon(3);
    case "ngon":
      return regularPolygon(input.sides);
    case "polygon": {
      const pts = input.polygonPoints.filter(
        (p) => Number.isFinite(p.x) && Number.isFinite(p.y),
      );
      return pts.length >= 3 ? pts.slice(0, MAX_SHAPE_POINTS) : regularPolygon(6);
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
  polygonPoints: Vec2[];
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
  const local = localPoints(input);
  const points = local.map((p, i) => {
    const jx = input.wigglePointsAmount * wave(input.wigglePointsSpeed, i * 0.17);
    const jy =
      input.wigglePointsAmount * wave(input.wigglePointsSpeed, i * 0.17 + 0.31);
    const lx = p.x * input.radius + jx;
    const ly = p.y * input.radius + jy;
    return {
      x: centerX + lx * cr - ly * sr,
      y: centerY + lx * sr + ly * cr,
    };
  });
  return { centerX, centerY, points, count: points.length };
}
