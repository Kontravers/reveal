export type DitherMode = "dither" | "dither-color" | "color";
export type DitherMatrix = 4 | 8;

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
};

export const DITHER_MODE_LABEL: Record<DitherMode, string> = {
  dither: "Mono Bayer",
  "dither-color": "Color Bayer",
  color: "Live color",
};
