import { resolve } from "node:path";
import { createWidgetViteConfig } from "./src/build/create-widget-vite-config.mjs";

export default createWidgetViteConfig({
  entry: resolve("src/schedule/schedule.js"),
  cssFileName: "schedule-widget",
  bundleName: "SibilliniEuropaScheduleWidget",
  fileName: "schedule-widget.js"
});
