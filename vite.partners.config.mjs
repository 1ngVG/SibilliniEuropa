import { resolve } from "node:path";
import { createWidgetViteConfig } from "./src/build/create-widget-vite-config.mjs";

export default createWidgetViteConfig({
  entry: resolve("src/partners/widget.js"),
  cssFileName: "partners-widget",
  bundleName: "SibilliniEuropaPartnersWidget",
  fileName: "partners-widget.js"
});