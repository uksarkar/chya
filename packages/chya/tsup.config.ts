import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"], // Entry file
  format: ["esm", "cjs"], // Generate both ESM and CJS formats
  outDir: "dist", // Output directory
  sourcemap: true, // Enable source maps
  clean: true, // Clean output directory before each build
  dts: true, // Generate TypeScript declaration files
  external: ["vite"]
});
