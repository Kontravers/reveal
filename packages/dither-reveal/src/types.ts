import {
  regularPolygon,
  type LensShape,
  type PathPoint,
  type Vec2,
  type WiggleMode,
} from "./shape";

export type DitherMode = "dither" | "dither-color" | "color";
export type DitherMatrix = 4 | 8;
export type { LensShape, PathPoint, Vec2, WiggleMode };

export type DitherRevealOptions = {
  src: string;
  mode: DitherMode;
  radius: number;
  softness: number;
  pixelSize: number;
  matrix: DitherMatrix;
  ink: string;
  paper: string;
  brightness: number;
  contrast: number;
  shadows: number;
  mids: number;
  highlights: number;
  follow: number;
  shape: LensShape;
  sides: number;
  rectAspect: number;
  ngonCurve: number;
  polygonPoints: PathPoint[];
  rotation: number;
  rotationSpeed: number;
  wigglePosAmount: number;
  wigglePosSpeed: number;
  wiggleRotAmount: number;
  wiggleRotSpeed: number;
  wigglePointsAmount: number;
  wigglePointsSpeed: number;
  wiggleMode: WiggleMode;
};

export const DEFAULT_DITHER_OPTIONS: DitherRevealOptions = {
  src: "/media/waves-480.mp4",
  mode: "dither",
  radius: 220,
  softness: 90,
  pixelSize: 4,
  matrix: 8,
  ink: "#141413",
  paper: "#e8e2d4",
  brightness: 0.1,
  contrast: 1.15,
  shadows: 0,
  mids: 0,
  highlights: 0,
  follow: 0.2,
  shape: "circle",
  sides: 6,
  rectAspect: 1.55,
  ngonCurve: 0,
  polygonPoints: regularPolygon(6),
  rotation: 0,
  rotationSpeed: 0,
  wigglePosAmount: 0,
  wigglePosSpeed: 0.35,
  wiggleRotAmount: 0,
  wiggleRotSpeed: 0.25,
  wigglePointsAmount: 0,
  wigglePointsSpeed: 0.45,
  wiggleMode: "loop",
};

export const DITHER_MODE_LABEL: Record<DitherMode, string> = {
  dither: "Mono Bayer",
  "dither-color": "Color Bayer",
  color: "Live color",
};
