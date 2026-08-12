import { defineConfig } from "vite";

export function createWidgetViteConfig({ entry, cssFileName, bundleName, fileName, emptyOutDir = false }) {
  return defineConfig({
    publicDir: "public",
    build: {
      outDir: "dist",
      emptyOutDir,
      cssCodeSplit: false,
      lib: {
        entry,
        cssFileName,
        name: bundleName,
        formats: ["iife"],
        fileName: () => fileName
      },
      rollupOptions: {
        output: {
          assetFileNames: (assetInfo) => {
            if (assetInfo.name === `${cssFileName}.css`) {
              return `${cssFileName}.css`;
            }

            return "assets/[name][extname]";
          }
        }
      }
    }
  });
}
