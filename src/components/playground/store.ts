import { create } from "zustand";
import {
  DEFAULT_DITHER_OPTIONS,
  type DitherRevealOptions,
} from "@kontravers/dither-reveal";

export const MEDIA = [
  { id: "waves", src: "/media/waves-480.mp4", label: "Waves" },
  { id: "citrus", src: "/media/citrus-480.mp4", label: "Citrus" },
  { id: "flower", src: "/media/flower.mp4", label: "Flower" },
] as const;

type LensStore = DitherRevealOptions & {
  patch: (partial: Partial<DitherRevealOptions>) => void;
  reset: () => void;
};

export const useLens = create<LensStore>((set) => ({
  ...DEFAULT_DITHER_OPTIONS,
  src: MEDIA[0].src,
  patch: (partial) => set(partial),
  reset: () => set({ ...DEFAULT_DITHER_OPTIONS, src: MEDIA[0].src }),
}));
