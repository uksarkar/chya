import { defineConfig } from "tsup";
import fs from "fs";
import babel from "@babel/core";

// List of extensions to include
const extensions = [".js", ".ts", ".json", ".tsx", ".jsx"];

export default defineConfig({
  entry: ["src/index.ts"], // Entry file
  format: ["esm", "cjs"], // Generate both ESM and CJS formats
  outDir: "dist", // Output directory
  sourcemap: true, // Enable source maps
  clean: true, // Clean output directory before each build
  dts: true, // Generate TypeScript declaration files
  external: [
    // List of external dependencies
    "@babel/core",
    "@babel/preset-typescript",
    "@chya/babel-plugin-chya",
    "@babel/preset-react",
    "vitefu",
    "vite"
  ],
});
