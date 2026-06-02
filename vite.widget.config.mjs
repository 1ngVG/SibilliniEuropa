import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  publicDir: "public",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    cssCodeSplit: false,
    lib: {
      entry: resolve("src/widget/widget.js"),
      cssFileName: "gallery-widget",
      name: "SibilliniEuropaGalleryWidget",
      formats: ["iife"],
      fileName: () => "gallery-widget.js"
    },
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === "gallery-widget.css") {
            return "gallery-widget.css";
          }

          return "assets/[name][extname]";
        }
      }
    }
  }
});
