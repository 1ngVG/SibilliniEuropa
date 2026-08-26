import { resolve } from "node:path";
import { createWidgetViteConfig } from "./src/build/create-widget-vite-config.mjs";

export default createWidgetViteConfig({
  entry: resolve("src/committee/widget.js"),
  cssFileName: "committee-widget",
  bundleName: "SibilliniEuropaCommitteeWidget",
  fileName: "committee-widget.js"
});
