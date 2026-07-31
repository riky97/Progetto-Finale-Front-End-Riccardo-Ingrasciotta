/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
    alias: {
      // React 17 predates the `exports` map, so Vitest's Node-style resolver
      // can't find the bare `react/jsx-runtime` specifier that Radix's ESM
      // build imports. Vite's own resolver handles it, so this is test-only.
      "react/jsx-runtime": "react/jsx-runtime.js",
    },
    server: {
      deps: {
        // Radix ships ESM only; inlining routes it through Vite's resolver so
        // the alias above actually applies.
        inline: [/radix-ui/],
      },
    },
  },
});
