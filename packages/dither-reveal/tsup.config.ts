import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    element: "src/element.ts",
  },
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  treeshake: true,
  external: ["react", "react/jsx-runtime"],
});
