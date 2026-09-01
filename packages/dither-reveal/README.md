# @kontravers/dither-reveal

Cursor-reactive section background. A looping video sits behind the page. A
soft lens under the pointer reveals it as mono Bayer, color Bayer, or live
color. One WebGL2 pass.

This package is the engine. The playground that designs a look lives in the
[Reveal repo](https://github.com/Kontravers/reveal).

## Install

```bash
npm i @kontravers/dither-reveal
```

React is a peer for the component. The custom element does not need it.

## React

```tsx
import { DitherReveal } from "@kontravers/dither-reveal";

<section className="relative min-h-[70vh] overflow-hidden bg-[#e8e2d4]">
  <DitherReveal
    src="/hero.mp4"
    mode="dither"
    shape="ngon"
    sides={6}
    ngonCurve={0.4}
    radius={220}
    softness={90}
  />
  <h1>Your copy</h1>
</section>
```

Parent must be `position: relative`. The canvas is `pointer-events: none`.

## HTML

```ts
import { defineDitherReveal } from "@kontravers/dither-reveal/element";
defineDitherReveal();
```

```html
<section style="position:relative;min-height:70vh;overflow:hidden;background:#e8e2d4">
  <dither-reveal
    src="/hero.mp4"
    mode="dither"
    shape="ngon"
    sides="6"
    ngon-curve="0.4"
    radius="220"
    softness="90"
  ></dither-reveal>
</section>
```

## Video

Muted, looping, ~480p, same-origin or CORS-enabled. The section background
should match `paper`.

## Scope

No Three.js. No second pass. Max 12 control points, 64 tessellated SDF samples.
Circle stays analytic.
