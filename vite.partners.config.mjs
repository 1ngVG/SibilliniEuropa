import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  publicDir: "public",
  build: {
    outDir: "dist",
    emptyOutDir: false,
    cssCodeSplit: false,
    lib: {
      entry: resolve("src/partners/widget.js"),
      cssFileName: "partners-widget",
      name: "SibilliniEuropaPartnersWidget",
      formats: ["iife"],
      fileName: () => "partners-widget.js"
    },
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === "partners-widget.css") {
            return "partners-widget.css";
          }

          return "assets/[name][extname]";
        }
      }
    }
  }
});