# Reveal — map and plan

Private local git on `main`. No GitHub remote in this environment (no `gh` auth).
History starts at the circular Bayer lens; shape work lands on top.

## What it is

A drop-in lens for any site section:

- Hidden looping video, object-fit cover
- Pointer-following vignette (now: circle; next: arbitrary shapes)
- Look: mono Bayer / color Bayer / live color
- Grade: brightness, contrast, shadows, mids, highlights
- Canvas is `pointer-events: none`; content stays clickable
- Pauses offscreen

## Map

```
src/lib/dither-reveal/     reusable engine
  types.ts                 options + defaults
  shader.ts                Bayer, grade, cover UV, mask
  shape.ts                 local vertices + oscillators   (new)
  renderer.ts              WebGL2, uniforms, rAF
  component.tsx            React drop-in
  element.ts               <dither-reveal> custom element
  snippet.ts               copy-paste React / HTML
  store.ts                 playground instrument state
  index.ts                 public exports

src/components/playground/
  control-panel.tsx        instrument UI
  polygon-editor.tsx       custom point canvas            (new)

src/routes/index.tsx       demo: three sections
public/media/              480p loops (waves, citrus, flower)
```

Auth and database stay off. No Three.js. Shader stays one fullscreen triangle.

## Lens shape system (this pass)

Replace the hard-coded circular mask with an SDF lens.

| Shape        | Settings                                      |
| ------------ | --------------------------------------------- |
| Circle       | size (`radius`), softness                     |
| Square       | size, rotation                                |
| Rectangle    | size, aspect, rotation                        |
| Triangle     | size, rotation (point-up 3-gon)               |
| N-gon        | sides 3–12, size, rotation                    |
| Custom poly  | 3–12 points on a canvas, size, rotation       |

All shapes share:

- **Size** — existing radius slider (half-extent / circumradius)
- **Softness** — SDF feather, same as today’s vignette falloff
- **Rotation** — static degrees + spin speed (rev/s)

### Motion module (whole shape)

- Position wiggle: amount (px), speed (Hz)
- Rotation wiggle: amount (deg), speed (Hz)
- Mode: **loop** (sine) or **zigzag** (triangle / ping-pong)

### Point motion (polygon / n-gon / tri / rect / square)

- Point wiggle: amount (px), speed (Hz), same loop / zigzag
- Applied in local space before rotation so the silhouette breathes

Circle stays analytic (no vertices). Everything else is a CPU vertex list
uploaded as `uniform vec2 uPoints[12]` each frame. Cheap.

### Custom polygon editor

- Square canvas in the instrument
- Drag handles, click to add (≤12), button to drop a point (≥3)
- Regularize to an n-gon at the current count
- Editor shows rest pose; live wiggle is only in the lens

## Implementation order

1. Types + `shape.ts` oscillators / vertex builders — done
2. Shader polygon SDF + circle branch — done
3. Renderer uploads points / center each frame — done
4. React props + store defaults (motion at 0 so the hero does not change) — done
5. Instrument: shape menu, per-shape knobs, motion module, polygon canvas — done
6. Demo sections: triangle + n-gon so the feature is visible without opening the panel — done
7. Snippets include the new props — done

## Later (not this pass)

- Star / rhombus / capsule as named presets (n-gon + custom already cover them)
- Per-point editor timeline
- GitHub remote when credentials exist
