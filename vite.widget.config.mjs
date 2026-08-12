import { resolve } from "node:path";
import { createWidgetViteConfig } from "./src/build/create-widget-vite-config.mjs";

export default createWidgetViteConfig({
  entry: resolve("src/gallery/widget.js"),
  cssFileName: "gallery-widget",
  bundleName: "SibilliniEuropaGalleryWidget",
  fileName: "gallery-widget.js"
});
