# Reveal

Cursor-reactive section backgrounds. A looping video sits behind the page. A
soft lens under the pointer reveals it as mono Bayer, color Bayer, or live
color. One WebGL2 pass.

Live playground: this repo’s homepage. Tune the instrument, copy React, HTML,
or the npm install line.

Repo: https://github.com/Kontravers/reveal

Package (not published yet): `@kontravers/dither-reveal`

## Run

```bash
npm install
npm run dev          # http://localhost:8080
npm run typecheck
npm run package:build
npm run package:pack
```

Node 22. Video in `public/media/` should stay muted, looping, ~480p, same-origin
or CORS-enabled.

## Drop-in

After the package is on npm:

```bash
npm i @kontravers/dither-reveal
```

```tsx
import { DitherReveal } from "@kontravers/dither-reveal";

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
`<dither-reveal>` in the package `element` entry mirrors the same attributes.

Until publish, the playground still copies the same snippet. The engine source
is `packages/dither-reveal`.

## Engine map

```
packages/dither-reveal/src/
  color.ts          hex → RGB
  types.ts          all options + defaults
  shape.ts          vertices, Bézier, tessellate, wiggle oscillators
  shader.ts         Bayer, grade, cover UV, circle/polygon SDF
  renderer.ts       WebGL2, video texture, rAF
  component.tsx     React drop-in (inline layout, no Tailwind)
  element.ts        <dither-reveal>
  snippet.ts        React / HTML / npm copy text
  index.ts          package entry

src/components/playground/
  store.ts            instrument state (not in the package)
  control-panel.tsx   instrument
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
4. Extract engine into `@kontravers/dither-reveal` (unpublished)

## Later

- Named presets (star, capsule) — n-gon + poly already cover them
- Publish `@kontravers/dither-reveal` to npm
- Hosted playground / shareable look URLs
