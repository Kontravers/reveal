import { useState, type ReactNode } from "react";
import { Check, Copy, RotateCcw, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { PolygonEditor } from "@/components/playground/polygon-editor";
import {
  DITHER_MODE_LABEL,
  htmlSnippet,
  reactSnippet,
  type DitherMode,
} from "@/lib/dither-reveal";
import {
  MAX_SHAPE_POINTS,
  SHAPE_LABEL,
  regularPolygon,
  type LensShape,
  type Vec2,
  type WiggleMode,
} from "@/lib/dither-reveal/shape";
import { MEDIA, useLens } from "@/lib/dither-reveal/store";
import { cn } from "@/lib/utils";

function Field({
  label,
  display,
  children,
}: {
  label: string;
  display: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-0">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[11px] font-medium tracking-[0.14em] text-muted uppercase">
          {label}
        </span>
        <span className="font-mono text-[11px] tabular-nums text-ink">{display}</span>
      </div>
      {children}
    </div>
  );
}

function Segmented<T extends string>({
  value,
  options,
  onChange,
  columns = 3,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  columns?: 2 | 3;
}) {
  return (
    <div
      className={cn(
        "grid gap-1 rounded-xl bg-paper-2 p-1",
        columns === 2 ? "grid-cols-2" : "grid-cols-3",
      )}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "h-9 rounded-lg px-2 text-[11px] font-medium tracking-wide transition-[background-color,color] duration-150",
            value === option.value
              ? "bg-ink text-paper"
              : "text-muted hover:text-ink",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function insertMidpoint(points: Vec2[]): Vec2[] {
  if (points.length >= MAX_SHAPE_POINTS) return points;
  let best = 0;
  let bestD = -1;
  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    if (!a || !b) continue;
    const d = Math.hypot(b.x - a.x, b.y - a.y);
    if (d > bestD) {
      bestD = d;
      best = i;
    }
  }
  const a = points[best];
  const b = points[(best + 1) % points.length];
  if (!a || !b) return points;
  const next = [...points];
  next.splice(best + 1, 0, { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
  return next;
}

export function ControlPanel() {
  const lens = useLens();
  const [copied, setCopied] = useState<"react" | "html" | null>(null);
  const [open, setOpen] = useState(false);

  const copy = async (kind: "react" | "html") => {
    const text = kind === "react" ? reactSnippet(lens) : htmlSnippet(lens);
    await navigator.clipboard.writeText(text);
    setCopied(kind);
    window.setTimeout(() => setCopied(null), 1400);
  };

  return (
    <div className="pointer-events-auto w-full max-w-md lg:max-w-sm">
      <button
        type="button"
        className="mb-2 flex h-11 w-full items-center justify-between rounded-xl bg-paper px-4 text-sm text-ink shadow-[0_0_0_1px_rgba(20,20,19,0.08),0_12px_32px_rgba(20,20,19,0.08)] lg:hidden"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="flex items-center gap-2 font-medium">
          <SlidersHorizontal className="size-4" />
          Lens controls
        </span>
        <span className="font-mono text-[11px] text-muted uppercase">
          {open ? "Hide" : "Show"}
        </span>
      </button>

      <aside
        className={cn(
          "flex max-h-[min(78vh,720px)] flex-col overflow-hidden rounded-3xl bg-paper p-4 shadow-[0_0_0_1px_rgba(20,20,19,0.08),0_18px_40px_rgba(20,20,19,0.08)]",
          open ? "flex" : "hidden lg:flex",
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-3 px-1">
          <div>
            <p className="font-mono text-[11px] tracking-[0.18em] text-muted uppercase">
              Instrument
            </p>
            <p className="mt-1 text-sm text-ink">Tune the reveal, then copy it.</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => lens.reset()}>
            <RotateCcw className="size-3.5" />
            Reset
          </Button>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-1 pb-2">
          <Segmented
            value={lens.mode}
            onChange={(mode: DitherMode) => lens.patch({ mode })}
            options={[
              { value: "dither", label: "Mono" },
              { value: "dither-color", label: "Color" },
              { value: "color", label: "Live" },
            ]}
          />
          <p className="text-xs text-muted">{DITHER_MODE_LABEL[lens.mode]}</p>

          <div className="grid grid-cols-3 gap-1">
            {MEDIA.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => lens.patch({ src: item.src })}
                className={cn(
                  "h-9 rounded-lg text-[11px] font-medium ring-1 transition-[background-color,color] duration-150",
                  lens.src === item.src
                    ? "bg-ink text-paper ring-ink"
                    : "bg-transparent text-muted ring-line hover:text-ink",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="border-t border-line pt-4">
            <p className="mb-3 text-[11px] font-medium tracking-[0.14em] text-muted uppercase">
              Shape
            </p>
            <Segmented
              value={lens.shape}
              onChange={(shape: LensShape) => {
                if (shape === "polygon" && lens.polygonPoints.length < 3) {
                  lens.patch({ shape, polygonPoints: regularPolygon(lens.sides) });
                } else {
                  lens.patch({ shape });
                }
              }}
              options={(
                ["circle", "square", "rectangle", "triangle", "ngon", "polygon"] as const
              ).map((value) => ({ value, label: SHAPE_LABEL[value] }))}
            />
          </div>

          <Field label="Size" display={`${Math.round(lens.radius)}px`}>
            <Slider
              aria-label="Size"
              value={lens.radius}
              min={60}
              max={480}
              onValueChange={(radius) => lens.patch({ radius })}
            />
          </Field>
          <Field label="Softness" display={`${Math.round(lens.softness)}px`}>
            <Slider
              aria-label="Softness"
              value={lens.softness}
              min={0}
              max={220}
              onValueChange={(softness) => lens.patch({ softness })}
            />
          </Field>
          <Field label="Rotation" display={`${Math.round(lens.rotation)}°`}>
            <Slider
              aria-label="Rotation"
              value={lens.rotation}
              min={-180}
              max={180}
              onValueChange={(rotation) => lens.patch({ rotation })}
            />
          </Field>
          <Field label="Spin" display={`${lens.rotationSpeed.toFixed(2)} r/s`}>
            <Slider
              aria-label="Spin"
              value={lens.rotationSpeed}
              min={-1}
              max={1}
              step={0.01}
              onValueChange={(rotationSpeed) => lens.patch({ rotationSpeed })}
            />
          </Field>

          {lens.shape === "rectangle" ? (
            <Field label="Aspect" display={lens.rectAspect.toFixed(2)}>
              <Slider
                aria-label="Aspect"
                value={lens.rectAspect}
                min={0.4}
                max={2.6}
                step={0.01}
                onValueChange={(rectAspect) => lens.patch({ rectAspect })}
              />
            </Field>
          ) : null}

          {lens.shape === "ngon" ? (
            <Field label="Sides" display={`${lens.sides}`}>
              <Slider
                aria-label="Sides"
                value={lens.sides}
                min={3}
                max={MAX_SHAPE_POINTS}
                step={1}
                onValueChange={(sides) => lens.patch({ sides })}
              />
            </Field>
          ) : null}

          {lens.shape === "polygon" ? (
            <div className="grid gap-3">
              <PolygonEditor
                points={lens.polygonPoints}
                onChange={(polygonPoints) => lens.patch({ polygonPoints })}
              />
              <div className="grid grid-cols-3 gap-1">
                <button
                  type="button"
                  className="h-9 rounded-lg text-[11px] font-medium text-muted ring-1 ring-line hover:text-ink"
                  onClick={() =>
                    lens.patch({ polygonPoints: insertMidpoint(lens.polygonPoints) })
                  }
                >
                  Add
                </button>
                <button
                  type="button"
                  className="h-9 rounded-lg text-[11px] font-medium text-muted ring-1 ring-line hover:text-ink"
                  onClick={() => {
                    if (lens.polygonPoints.length <= 3) return;
                    lens.patch({
                      polygonPoints: lens.polygonPoints.slice(0, -1),
                    });
                  }}
                >
                  Drop
                </button>
                <button
                  type="button"
                  className="h-9 rounded-lg text-[11px] font-medium text-muted ring-1 ring-line hover:text-ink"
                  onClick={() =>
                    lens.patch({
                      polygonPoints: regularPolygon(
                        Math.max(3, lens.polygonPoints.length),
                      ),
                    })
                  }
                >
                  Regular
                </button>
              </div>
              <p className="text-[11px] text-muted">
                Drag handles. Click empty canvas to add a point (
                {lens.polygonPoints.length}/{MAX_SHAPE_POINTS}).
              </p>
            </div>
          ) : null}

          <Field label="Pixel size" display={`${lens.pixelSize.toFixed(1)}`}>
            <Slider
              aria-label="Pixel size"
              value={lens.pixelSize}
              min={1}
              max={12}
              step={0.5}
              onValueChange={(pixelSize) => lens.patch({ pixelSize })}
            />
          </Field>
          <Field label="Follow" display={lens.follow.toFixed(2)}>
            <Slider
              aria-label="Follow"
              value={lens.follow}
              min={0.04}
              max={0.6}
              step={0.01}
              onValueChange={(follow) => lens.patch({ follow })}
            />
          </Field>

          <div className="border-t border-line pt-4">
            <p className="mb-3 text-[11px] font-medium tracking-[0.14em] text-muted uppercase">
              Motion
            </p>
            <Segmented
              value={lens.wiggleMode}
              columns={2}
              onChange={(wiggleMode: WiggleMode) => lens.patch({ wiggleMode })}
              options={[
                { value: "loop", label: "Loop" },
                { value: "zigzag", label: "Zigzag" },
              ]}
            />
            <Field label="Pos amount" display={`${Math.round(lens.wigglePosAmount)}px`}>
              <Slider
                aria-label="Position wiggle amount"
                value={lens.wigglePosAmount}
                min={0}
                max={80}
                onValueChange={(wigglePosAmount) => lens.patch({ wigglePosAmount })}
              />
            </Field>
            <Field label="Pos speed" display={`${lens.wigglePosSpeed.toFixed(2)} Hz`}>
              <Slider
                aria-label="Position wiggle speed"
                value={lens.wigglePosSpeed}
                min={0}
                max={2}
                step={0.01}
                onValueChange={(wigglePosSpeed) => lens.patch({ wigglePosSpeed })}
              />
            </Field>
            <Field label="Rot amount" display={`${Math.round(lens.wiggleRotAmount)}°`}>
              <Slider
                aria-label="Rotation wiggle amount"
                value={lens.wiggleRotAmount}
                min={0}
                max={45}
                onValueChange={(wiggleRotAmount) => lens.patch({ wiggleRotAmount })}
              />
            </Field>
            <Field label="Rot speed" display={`${lens.wiggleRotSpeed.toFixed(2)} Hz`}>
              <Slider
                aria-label="Rotation wiggle speed"
                value={lens.wiggleRotSpeed}
                min={0}
                max={2}
                step={0.01}
                onValueChange={(wiggleRotSpeed) => lens.patch({ wiggleRotSpeed })}
              />
            </Field>
            {lens.shape === "circle" ? null : (
              <>
                <Field
                  label="Point amount"
                  display={`${Math.round(lens.wigglePointsAmount)}px`}
                >
                  <Slider
                    aria-label="Point wiggle amount"
                    value={lens.wigglePointsAmount}
                    min={0}
                    max={48}
                    onValueChange={(wigglePointsAmount) =>
                      lens.patch({ wigglePointsAmount })
                    }
                  />
                </Field>
                <Field
                  label="Point speed"
                  display={`${lens.wigglePointsSpeed.toFixed(2)} Hz`}
                >
                  <Slider
                    aria-label="Point wiggle speed"
                    value={lens.wigglePointsSpeed}
                    min={0}
                    max={2}
                    step={0.01}
                    onValueChange={(wigglePointsSpeed) =>
                      lens.patch({ wigglePointsSpeed })
                    }
                  />
                </Field>
              </>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            {(["4", "8"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => lens.patch({ matrix: Number(m) as 4 | 8 })}
                className={cn(
                  "h-9 rounded-lg text-[11px] font-medium ring-1 transition-[background-color,color] duration-150",
                  String(lens.matrix) === m
                    ? "bg-ink text-paper ring-ink"
                    : "text-muted ring-line hover:text-ink",
                )}
              >
                {m}×{m} Bayer
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-2 text-[11px] font-medium tracking-[0.14em] text-muted uppercase">
              Ink
              <span className="flex h-11 items-center gap-2 rounded-xl bg-paper-2 px-3">
                <input
                  type="color"
                  value={lens.ink}
                  onChange={(e) => lens.patch({ ink: e.target.value })}
                  className="size-5 cursor-pointer rounded-md bg-transparent"
                />
                <span className="font-mono text-[11px] text-ink normal-case">
                  {lens.ink}
                </span>
              </span>
            </label>
            <label className="grid gap-2 text-[11px] font-medium tracking-[0.14em] text-muted uppercase">
              Paper
              <span className="flex h-11 items-center gap-2 rounded-xl bg-paper-2 px-3">
                <input
                  type="color"
                  value={lens.paper}
                  onChange={(e) => lens.patch({ paper: e.target.value })}
                  className="size-5 cursor-pointer rounded-md bg-transparent"
                />
                <span className="font-mono text-[11px] text-ink normal-case">
                  {lens.paper}
                </span>
              </span>
            </label>
          </div>

          <div className="border-t border-line pt-4">
            <p className="mb-3 text-[11px] font-medium tracking-[0.14em] text-muted uppercase">
              Grade
            </p>
            <Field label="Brightness" display={lens.brightness.toFixed(2)}>
              <Slider
                aria-label="Brightness"
                value={lens.brightness}
                min={-0.5}
                max={0.5}
                step={0.01}
                onValueChange={(brightness) => lens.patch({ brightness })}
              />
            </Field>
            <Field label="Contrast" display={lens.contrast.toFixed(2)}>
              <Slider
                aria-label="Contrast"
                value={lens.contrast}
                min={0.4}
                max={2}
                step={0.01}
                onValueChange={(contrast) => lens.patch({ contrast })}
              />
            </Field>
            <Field label="Shadows" display={lens.shadows.toFixed(2)}>
              <Slider
                aria-label="Shadows"
                value={lens.shadows}
                min={-0.6}
                max={0.6}
                step={0.01}
                onValueChange={(shadows) => lens.patch({ shadows })}
              />
            </Field>
            <Field label="Mids" display={lens.mids.toFixed(2)}>
              <Slider
                aria-label="Mids"
                value={lens.mids}
                min={-0.6}
                max={0.6}
                step={0.01}
                onValueChange={(mids) => lens.patch({ mids })}
              />
            </Field>
            <Field label="Highlights" display={lens.highlights.toFixed(2)}>
              <Slider
                aria-label="Highlights"
                value={lens.highlights}
                min={-0.6}
                max={0.6}
                step={0.01}
                onValueChange={(highlights) => lens.patch({ highlights })}
              />
            </Field>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 border-t border-line pt-3">
          <Button variant="outline" size="sm" onClick={() => void copy("react")}>
            {copied === "react" ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            React
          </Button>
          <Button variant="outline" size="sm" onClick={() => void copy("html")}>
            {copied === "html" ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            HTML
          </Button>
        </div>
      </aside>
    </div>
  );
}
