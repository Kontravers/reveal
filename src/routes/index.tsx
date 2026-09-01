import { createFileRoute } from "@tanstack/react-router";
import { ArrowDownRight } from "lucide-react";
import { ControlPanel } from "@/components/playground/control-panel";
import { DitherReveal } from "@/lib/dither-reveal";
import { useLens } from "@/lib/dither-reveal/store";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const lens = useLens();
  const { patch: _, reset: __, ...hero } = lens;

  return (
    <main className="bg-paper text-ink">
      <section className="relative min-h-svh overflow-hidden">
        <DitherReveal {...hero} />

        <div className="relative z-10 flex min-h-svh flex-col justify-between px-5 py-6 sm:px-8 lg:px-10">
          <header className="flex items-center justify-between gap-4">
            <p className="font-mono text-[11px] tracking-[0.22em] text-ink uppercase">
              Reveal
            </p>
            <p className="hidden max-w-sm text-right text-xs text-muted sm:block">
              Move the pointer. The lens can be a circle, n-gon, or a polygon
              you draw — Bayer, color dither, or live film.
            </p>
          </header>

          <div className="grid items-end gap-8 lg:grid-cols-[1fr_22rem]">
            <div className="max-w-3xl pb-4">
              <p className="font-mono text-[11px] tracking-[0.18em] text-muted uppercase">
                Section background
              </p>
              <h1 className="mt-4 font-display text-5xl leading-[0.95] tracking-[-0.03em] text-ink sm:text-7xl">
                The picture
                <br />
                lives under
                <br />
                the cursor.
              </h1>
              <p className="mt-6 max-w-md text-sm leading-relaxed text-muted sm:text-base">
                Drop a low-res looping video into any section. Pick a shape,
                grade the film, then copy the snippet. One pass on the GPU.
              </p>
              <p className="mt-8 flex items-center gap-2 font-mono text-[11px] tracking-[0.14em] text-muted uppercase">
                Tune the instrument
                <ArrowDownRight className="size-3.5 lg:hidden" />
              </p>
            </div>
            <ControlPanel />
          </div>
        </div>
      </section>

      <section className="relative min-h-[85svh] overflow-hidden bg-ink text-paper">
        <DitherReveal
          src="/media/citrus-480.mp4"
          mode="color"
          shape="triangle"
          radius={280}
          softness={70}
          rotation={-8}
          rotationSpeed={0.04}
          wigglePosAmount={18}
          wigglePosSpeed={0.22}
          wiggleRotAmount={6}
          wiggleRotSpeed={0.18}
          wiggleMode="loop"
          pixelSize={2}
          brightness={0.04}
          contrast={1.15}
          shadows={-0.08}
          mids={0.04}
          highlights={0.12}
          paper="#141413"
          ink="#e8e2d4"
        />
        <div className="relative z-10 mx-auto flex min-h-[85svh] max-w-5xl flex-col justify-end px-5 py-16 sm:px-8">
          <p className="font-mono text-[11px] tracking-[0.18em] text-paper/60 uppercase">
            Triangle + motion
          </p>
          <h2 className="mt-4 max-w-2xl font-display text-4xl leading-[1.05] tracking-[-0.03em] sm:text-6xl">
            Same film. A different aperture.
          </h2>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-paper/70">
            Live color through a spinning triangle, with a slow position and
            rotation wiggle. Loop or zigzag from the instrument.
          </p>
        </div>
      </section>

      <section className="relative overflow-hidden border-t border-line px-5 py-20 sm:px-8">
        <DitherReveal
          src="/media/flower.mp4"
          mode="dither-color"
          shape="ngon"
          sides={5}
          ngonCurve={0.72}
          radius={200}
          softness={48}
          pixelSize={4}
          matrix={4}
          wigglePointsAmount={14}
          wigglePointsSpeed={0.4}
          wiggleMode="zigzag"
          ink="#141413"
          paper="#e8e2d4"
          contrast={1.25}
        />
        <div className="relative z-10 mx-auto grid max-w-5xl gap-10 lg:grid-cols-2">
          <div>
            <p className="font-mono text-[11px] tracking-[0.18em] text-muted uppercase">
              Drop-in
            </p>
            <h2 className="mt-4 font-display text-4xl tracking-[-0.03em] sm:text-5xl">
              One component per section.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
              Parent needs position relative. Draw a custom polygon in the
              instrument, or pass `shape`, `sides`, and motion props yourself.
            </p>
          </div>
          <pre className="overflow-x-auto rounded-3xl bg-ink p-5 font-mono text-[11px] leading-relaxed text-paper shadow-[0_0_0_1px_rgba(20,20,19,0.08)] sm:p-6">
            {`<section className="relative min-h-[70vh]">
  <DitherReveal
    src="/hero.mp4"
    mode="dither"
    shape="ngon"
    sides={6}
    radius={220}
    softness={90}
    rotation={0}
    wiggleMode="loop"
  />
  <h1>Your copy</h1>
</section>`}
          </pre>
        </div>
      </section>

      <footer className="border-t border-line px-5 py-8 sm:px-8">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono tracking-[0.16em] uppercase">Reveal</p>
          <p>Shaped Bayer lens for any site. Low-res video. One GPU pass.</p>
        </div>
      </footer>
    </main>
  );
}
