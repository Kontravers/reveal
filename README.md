# Reveal

Cursor-reactive section backgrounds. A looping video sits behind the page. A
soft lens under the pointer reveals it as mono Bayer, color Bayer, or live
color. One WebGL2 pass. Drop-in per section.

Live playground: this repo’s homepage. Tune the instrument, copy React or HTML.

Repo: https://github.com/Kontravers/reveal (private)

## Run

```bash
npm install
npm run dev          # http://localhost:8080
npm run build        # Vercel/Nitro production output
npm run typecheck
```

Node 22. Video in `public/media/` should stay muted, looping, ~480p, same-origin
or CORS-enabled.

## Drop-in

Copy `src/lib/dither-reveal/` into another React app, or use the custom element.

```tsx
<section className="relative min-h-[70vh] overflow-hidden bg-[#e8e2d4]">
  <DitherReveal
    src="/hero.mp4"
    mode="dither"          // dither | dither-color | color
    shape="ngon"           // circle | square | rectangle | triangle | ngon | polygon
    sides={6}
    ngonCurve={0.4}        // 0 = sharp n-gon, 1 ≈ circumcircle
    radius={220}
    softness={90}
    rotation={0}
    rotationSpeed={0}
    wiggleMode="loop"      // loop | zigzag
  />
  <h1>Your copy</h1>
</section>
```

Parent must be `position: relative`. The canvas is `pointer-events: none`.
`<dither-reveal>` in `element.ts` mirrors the same attributes.

## Engine map

```
src/lib/dither-reveal/
  types.ts          all options + defaults
  shape.ts          vertices, Bézier, tessellate, wiggle oscillators
  shader.ts         Bayer, grade, cover UV, circle/polygon SDF
  renderer.ts       WebGL2, video texture, rAF
  component.tsx     React drop-in
  element.ts        <dither-reveal>
  snippet.ts        copy-paste from the instrument
  store.ts          playground state

src/components/playground/
  control-panel.tsx instrument
  polygon-editor.tsx  points + Bézier handles

src/routes/index.tsx   three demo sections
public/media/          waves, citrus, flower (480p)
```

No auth, no database, no Three.js. Shader is one fullscreen triangle.
Polygons tessellate on the CPU (max 12 control points → 64 SDF samples).
Circle stays analytic.

## Shapes and motion

- **Circle / square / rect / tri / n-gon / poly**
- N-gon **Curve** slider turns every vertex into circular tangent handles
- Poly: click a point → **Bézier** (or double-click). Squares = corners,
  circles = curves. Drag knobs. Alt-drag breaks the mirror. **Curve all**
- Shared: size, softness, rotation, spin (rev/s)
- Motion: position / rotation / point wiggle, amount + Hz, loop or zigzag

## Grade and look

`mode`, `pixelSize`, `matrix` (4 or 8), `ink`, `paper`, `brightness`,
`contrast`, `shadows`, `mids`, `highlights`, `follow`.

## Git

`main` on GitHub. History:

1. Circular Bayer lens playground
2. Shape + motion module
3. Per-point Bézier + n-gon curve

## Later

- Named presets (star, capsule) — n-gon + poly already cover them
- Extract `dither-reveal` as its own package
- Public repo / Vercel demo when you want others on it
