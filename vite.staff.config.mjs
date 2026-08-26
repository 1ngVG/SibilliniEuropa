import { resolve } from "node:path";
import { createWidgetViteConfig } from "./src/build/create-widget-vite-config.mjs";

export default createWidgetViteConfig({
  entry: resolve("src/staff/widget.js"),
  cssFileName: "staff-widget",
  bundleName: "SibilliniEuropaStaffWidget",
  fileName: "staff-widget.js"
});
