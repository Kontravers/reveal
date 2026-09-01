# Reveal — working notes

Canonical pickup doc is [README.md](./README.md). This file is the short
status board so a new session does not re-litigate architecture.

## Now

GitHub: https://github.com/Kontravers/reveal (public)

Engine lives in `packages/dither-reveal` and is imported as
`@kontravers/dither-reveal`. Playground store stays in
`src/components/playground/store.ts`. Bézier and n-gon curve are in.
Motion defaults to 0 on the hero so the first section stays still.

Package is scaffolded, **not published**. Name is free on npm as of
2026-09-02. React is an optional peer. Custom element is
`@kontravers/dither-reveal/element`.

## Do not

- Add Three.js
- Split the shader into multiple passes
- Turn auth/db on
- Raise control points above 12 or tessellation above 64 without measuring
- Put playground / Zustand / Tailwind into the published package
- Publish from a dirty tree or without `npm run package:pack` first

## Next (when asked)

- Create npm org `kontravers` and publish `0.1.0` (see Publish below)
- Shareable look URLs (`?l=` config)
- Hosted playground
- Star / rhombus / capsule named presets

## Publish

From repo root, after `npm install`:

1. `npm run package:build`
2. `npm run package:pack` — inspect the `.tgz`, then delete it
3. Create the npm org if needed: https://www.npmjs.com/org/create
4. `npm login`
5. `npm publish -w @kontravers/dither-reveal --access public`

Bump with `npm version patch -w @kontravers/dither-reveal` then publish
again. `prepublishOnly` rebuilds dist.

Until that ships, “Copy npm” in the instrument is the intended install line,
not a live registry package.
