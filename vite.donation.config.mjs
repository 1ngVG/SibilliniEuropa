import { resolve } from "node:path";
import { createWidgetViteConfig } from "./src/build/create-widget-vite-config.mjs";

export default createWidgetViteConfig({
  entry: resolve("src/donation/widget.js"),
  cssFileName: "donation-widget",
  bundleName: "SibilliniEuropaDonationWidget",
  fileName: "donation-widget.js"
});
