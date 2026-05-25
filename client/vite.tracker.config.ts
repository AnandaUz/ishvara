import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@shared": resolve(__dirname, "../shared"),
      "@base": resolve(__dirname, "../_base"),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, "src/tracker.ts"),
      name: "Tracker",
      fileName: () => "tracker.js", // всегда одно имя
      formats: ["iife"],
    },
    outDir: resolve(__dirname, "public"),
    emptyOutDir: false,
    minify: false,
  },
});
