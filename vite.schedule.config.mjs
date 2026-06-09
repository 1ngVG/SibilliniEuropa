import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  publicDir: "public",
  build: {
    outDir: "dist",
    emptyOutDir: false,
    cssCodeSplit: false,
    lib: {
      entry: resolve("src/schedule/schedule.js"),
      cssFileName: "schedule-widget",
      name: "SibilliniEuropaScheduleWidget",
      formats: ["iife"],
      fileName: () => "schedule-widget.js"
    },
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === "schedule-widget.css") {
            return "schedule-widget.css";
          }

          return "assets/[name][extname]";
        }
      }
    }
  }
});
